import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

export default function useHls(
  src: string
): [React.RefObject<HTMLVideoElement>, boolean] {
  const $video = useRef<HTMLVideoElement>(null);
  const duration = useRef<number>(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const $v = $video.current!;

    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.startLevel = 3;
      // hls.on(Hls.Events.LEVEL_SWITCHED, (...args) => console.log(...args));
      hls.loadSource(src);
      hls.attachMedia($v);
      hls.on(Hls.Events.LEVEL_LOADED, (_e, data) => {
        // console.log(data);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLoaded(true);
        $v.addEventListener("loadedmetadata", () => {
          duration.current = $v.duration;
          // console.log(data);
        });
      });
    } else if ($v.canPlayType("application/vnd.apple.mpegurl")) {
      $v.src = src;
      $v.addEventListener("loadedmetadata", () => {
        $v.play();
      });
    }
  }, []);

  return [$video, loaded];
}
