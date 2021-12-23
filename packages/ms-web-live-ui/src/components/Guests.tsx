import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Guest as GuestType } from "@mindfulstudio/ms-web-live-types";
import { useEffect, useRef } from "react";
import useSession from "../hooks/use-session";
import camera from "../images/svg-sprites/camera.svg";

type Props = {
  guests: GuestType[];
  activeGuestStream?: MediaStream;
  streams: { sender: GuestType; stream: MediaStream }[];
};

const Root = styled.div`
  display: flex;
`;

const Frame = styled.div`
  box-shadow: 0 0 4px 3px rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  overflow: hidden;
  width: 90px;
  height: 120px;
`;

const CameraIcon = (() => {
  const Root = styled.svg`
    width: 26px;
    height: 16px;
  `;

  return ({ className }: { className?: string }) => (
    <Root viewBox={camera.viewBox} className={className}>
      <use xlinkHref={`#${camera.id}`} />
    </Root>
  );
})();

const Header = styled.header`
  display: flex;
  align-items: center;
  height: 14px;
  margin-bottom: 5px;
`;

const Label = styled.div`
  color: #fff;
  font-weight: 120;
  letter-spacing: 0.1px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Video = styled.video`
  height: 120px;
  width: 90px;
  object-fit: cover;
`;

const ActiveGuest = (() => {
  const Root = styled.div`
    margin-right: 50px;
    width: 90px;
  `;

  const Placeholder = styled.div`
    height: 120px;
    width: 90px;
    border: 1px solid #107591;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  `;

  const Badge = styled.span`
    background-color: #107591;
    color: #eee;
    font-weight: 300;
    font-size: 11px;
    height: 14px;
    line-height: 14px;
    padding: 0 4px;
    margin-right: 6px;
    border-radius: 1px;
  `;

  const CTAText = styled.span`
    color: #fff;
    font-size: 13px;
    font-weight: 50;
    text-align: center;
  `;

  const Cam = ({ stream }: { stream: MediaStream }) => {
    const $video = useRef<HTMLVideoElement>(null);
    useEffect(() => {
      if ($video.current !== null) {
        $video.current.srcObject = stream;
      }
    }, []);
    return <Video autoPlay ref={$video} />;
  };

  const Content = ({ stream }: { stream?: MediaStream }) => {
    if (typeof stream !== "undefined") {
      return <Cam stream={stream} />;
    }

    return (
      <Placeholder>
        <CameraIcon
          css={css`
            margin-bottom: 6px;
          `}
        />
        <CTAText>
          enable
          <br />
          camera
        </CTAText>
      </Placeholder>
    );
  };

  return ({ guest, stream }: { guest?: GuestType; stream?: MediaStream }) => {
    return (
      <Root>
        <Header>
          <Badge>you</Badge>
          <Label>{guest?.id}</Label>
        </Header>
        <Content stream={stream} />
      </Root>
    );
  };
})();

const Separator = ({}: {}) => {
  return (
    <img
      src={require("../images/line.png").default.src}
      width={1}
      height={138}
      css={css`
        margin-right: 50px;
        position: relative;
        top: 6px;
      `}
    />
  );
};

const Guest = (() => {
  const Root = styled.div`
    width: 90px;
    &:not(:last-of-type) {
      margin-right: 20px;
    }
  `;

  return ({ id, stream }: GuestType & { stream?: MediaStream }) => {
    const $video = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if ($video.current !== null && stream) {
        $video.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <Root>
        <Header>
          <Label>{id}</Label>
        </Header>
        <Frame>
          <Video autoPlay ref={$video} />
        </Frame>
      </Root>
    );
  };
})();

const Guests = ({ guests, streams }: Props) => {
  const session = useSession();

  if (!session) {
    return null;
  }

  return (
    <Root>
      <ActiveGuest guest={session.guest} stream={session.stream} />
      <Separator />
      {guests.map((g) => {
        let stream = streams.find((s) => s.sender.id === g.id);
        return <Guest key={g.id} {...g} stream={stream && stream.stream} />;
      })}
    </Root>
  );
};

export default Guests;
