import styled from "@emotion/styled";
import { Guest, Session } from "@mindfulstudio/ms-web-live-types";
import { useEffect, useState } from "react";
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

const videoSrc =
  "https://player.vimeo.com/external/609649648.m3u8?s=1fd23ec0f437a504a9b2cce3e4db2233de3b7052";

function getNonActiveGuests(guests: Guest[], session: Session) {
  return session === null
    ? guests
    : guests.filter((g) => g.id !== session.guest.id);
}

function MainPage({ guests: initialGuests }: Props) {
  const [$video] = useHls(videoSrc);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [session, setSession] = useState<Session>(null);

  const { socket, connected } = useSocket({
    onUpdate: (guests) => setGuests(guests),
  });

  useEffect(() => {
    if (connected && socket.current !== null) {
      setSession({ guest: { id: socket.current.id } });
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Send any ice candidates to the other peer.
    pc.onicecandidate = ({ candidate }) => {
      console.log("ic");
      console.log(candidate);
      // signaling.send({candidate})
    };

    // Let the "negotiationneeded" event trigger offer generation.
    pc.onnegotiationneeded = async () => {
      console.log("nn");
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log(offer);
        // Send the offer to the other peer.
        // signaling.send({ desc: pc.localDescription });
      } catch (err) {
        console.error(err);
      }
    };

    // Once remote track media arrives, show it in remote video element.
    pc.ontrack = (event) => {
      // console.log("t");
      // Don't set srcObject again if it is already set.
      // if (remoteView.srcObject) return;
      // remoteView.srcObject = event.streams[0];
    };

    // Call start() to initiate.
    async function start() {
      try {
        // Get local stream, show it in self-view, and add it to be sent.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        // console.log(stream);
        // selfView.srcObject = stream;
      } catch (err) {
        console.error(err);
      }
    }
    start();

    // signaling.onmessage = async ({ desc, candidate }) => {
    //   try {
    //     if (desc) {
    //       // If you get an offer, you need to reply with an answer.
    //       if (desc.type === "offer") {
    //         await pc.setRemoteDescription(desc);
    //         const stream = await navigator.mediaDevices.getUserMedia(
    //           constraints
    //         );
    //         stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    //         await pc.setLocalDescription(await pc.createAnswer());
    //         signaling.send({ desc: pc.localDescription });
    //       } else if (desc.type === "answer") {
    //         await pc.setRemoteDescription(desc);
    //       } else {
    //         console.log("Unsupported SDP type.");
    //       }
    //     } else if (candidate) {
    //       await pc.addIceCandidate(candidate);
    //     }
    //   } catch (err) {
    //     console.error(err);
    //   }
    // };
  }, [connected]);

  return (
    <Root>
      <SessionContext.Provider value={session}>
        <Background>
          <Video
            autoPlay={false}
            muted
            ref={$video}
            poster={require("../images/poster.jpg").default.src}
          />
          <TopGrad />
          <BottomGrad />
        </Background>
        <Content>
          <GuestsContainer>
            <Guests guests={getNonActiveGuests(guests, session)} />
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
