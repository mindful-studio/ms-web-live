import styled from "@emotion/styled";
import { Guest, Session } from "@mindfulstudio/ms-web-live-types";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import Guests from "../components/Guests";
import useHls from "../hooks/use-hls";
import { SessionContext } from "../hooks/use-session";
import useSocket from "../hooks/use-socket";
import logo from "../images/svg-sprites/mindful-studio-live.svg";

export type Props = { guests: Guest[] };

const Root = styled.div``;

const Background = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
`;

const Content = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Grad = styled.div`
  position: absolute;
  width: 100%;
`;

const TopGrad = styled(Grad)`
  height: 250px;
  background-image: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0) 100%
  );
`;

const BottomGrad = styled(Grad)`
  height: 120px;
  bottom: 0;
  background-image: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0) 100%
  );
`;

const GuestsContainer = styled.div`
  margin-bottom: 30px;
  padding: 0 22px;
`;

const Footer = styled.footer`
  height: 60px;
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 22px;
`;

const Logo = (() => {
  const Root = styled.svg`
    width: 211px;
    height: 24px;
  `;

  return () => (
    <Root viewBox={logo.viewBox}>
      <use xlinkHref={`#${logo.id}`} />
    </Root>
  );
})();

const videoSrc = "https://hls.jakes.world/hls/stream.m3u8";

function getNonActiveGuests(guests: Guest[], session?: Session) {
  return typeof session === "undefined"
    ? guests
    : guests.filter((g) => g.id !== session.guest.id);
}

const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: "turn:ice.mindfulstudio.io:3478",
      username: "ice",
      credential: "ice",
    },
  ],
};

type GuestPeerConnection = {
  guest: Guest;
  pc: RTCPeerConnection;
};

type TrackCallback = (sender: Guest, stream: MediaStream) => void;

function getPeer(
  peers: MutableRefObject<GuestPeerConnection[]>,
  guest: Guest,
  session: Session,
  onTrack: TrackCallback
): GuestPeerConnection {
  let peer;
  peer = peers.current.find((p) => p.guest.id === guest.id);
  if (!peer) {
    peer = addPeer(peers, guest, session, onTrack);
  }
  return peer;
}

function addPeer(
  peers: MutableRefObject<GuestPeerConnection[]>,
  guest: Guest,
  session: Session,
  onTrack: TrackCallback
) {
  const pc = new RTCPeerConnection(rtcConfig);
  const peer = { guest, pc };
  peers.current.push(peer);

  const { socket } = session;

  pc.addEventListener("negotiationneeded", async () => {
    console.log("on negotiation needed");

    await pc.setLocalDescription(
      await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
    );

    socket.emit("offer", {
      sender: session.guest,
      recipient: guest,
      offer: pc.localDescription,
    });
  });

  pc.addEventListener("icecandidate", ({ candidate }) => {
    console.log("on ice candidate");

    socket.emit("candidate", {
      sender: session.guest,
      recipient: guest,
      candidate,
    });
  });

  pc.addEventListener("track", (event) => {
    console.log("on track", event);
    onTrack(guest, event.streams[0]);
    // Don't set srcObject again if it is already set.
    // if (remoteView.srcObject) return;
    // remoteView.srcObject = event.streams[0];
  });

  session.stream
    .getTracks()
    .forEach((track) => pc.addTrack(track, session.stream));

  return peer;
}

function MainPage({ guests: initialGuests }: Props) {
  const [$video] = useHls(videoSrc);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [session, setSession] = useState<Session>();
  const [activeGuestStream, setActiveGuestStream] = useState<MediaStream>();
  const peerConnections = useRef<GuestPeerConnection[]>([]);
  const [streams, setStreams] = useState<
    { sender: Guest; stream: MediaStream }[]
  >([]);
  const init = useRef(false);

  const socket = useSocket({
    onUpdate: (guests) => setGuests(guests),
  });

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => setActiveGuestStream(stream));
  }, []);

  useEffect(() => {
    if (socket && activeGuestStream && !session) {
      setSession({
        guest: { id: socket.id },
        socket,
        stream: activeGuestStream,
      });
    }
  }, [socket, activeGuestStream]);

  const onTrack: TrackCallback = (sender, stream) => {
    console.log("setting");
    setStreams([...streams, { sender, stream }]);
  };

  useEffect(() => {
    if (!session || init.current === true) {
      return;
    }

    const { socket } = session;

    guests.forEach((g) => addPeer(peerConnections, g, session, onTrack));

    socket.on(
      "offer",
      async (message: { sender: Guest; offer: RTCSessionDescriptionInit }) => {
        console.log("receive offer from", message.sender.id);

        const { pc } = getPeer(
          peerConnections,
          message.sender,
          session,
          onTrack
        );

        await pc.setRemoteDescription(message.offer);
        await pc.setLocalDescription(await pc.createAnswer());

        console.log(
          `answering from:${session.guest.id} to:${message.sender.id}`
        );

        socket.emit("answer", {
          sender: session.guest,
          recipient: message.sender,
          answer: pc.localDescription,
        });
      }
    );

    socket.on(
      "answer",
      async (message: { sender: Guest; answer: RTCSessionDescriptionInit }) => {
        console.log("receive answer");

        const { pc } = getPeer(
          peerConnections,
          message.sender,
          session,
          onTrack
        );
        await pc.setRemoteDescription(message.answer);
        console.log(message.answer);
      }
    );

    socket.on(
      "candidate",
      (message: { sender: Guest; candidate: RTCIceCandidate }) => {
        console.log("receive candidate");

        const { pc } = getPeer(
          peerConnections,
          message.sender,
          session,
          onTrack
        );
        pc.addIceCandidate(message.candidate);
      }
    );

    init.current = true;
  }, [session]);

  return (
    <Root>
      <SessionContext.Provider value={session}>
        <Background>
          <Video
            autoPlay={true}
            muted
            ref={$video}
            poster={require("../images/poster.jpg").default.src}
          />
          <TopGrad />
          <BottomGrad />
        </Background>
        <Content>
          <GuestsContainer>
            <Guests
              guests={getNonActiveGuests(guests, session)}
              streams={streams}
            />
          </GuestsContainer>
          <Footer>
            <Logo />
          </Footer>
        </Content>
      </SessionContext.Provider>
    </Root>
  );
}

export default MainPage;
