import Head from "next/head";
import { MainPage } from "@mindfulstudio/ms-web-live-ui";
import { Guest } from "@mindfulstudio/ms-web-live-types";
import { GetServerSideProps } from "next";
import { LiveServerResponse } from "../../server";

export default function Home({ guests }: { guests: Guest[] }) {
  return (
    <div>
      <Head>
        <title>Mindful Studio Live</title>
        <script src="/socket.io/socket.io.js"></script>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/reset-css@5.0.1/reset.css"
        />
        {process.env.NODE_ENV === "production" && (
          <>
            <script
              crossOrigin=""
              src="https://unpkg.com/react@17/umd/react.production.min.js"
            />
            <script
              crossOrigin=""
              src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"
            />
            <script
              crossOrigin=""
              src="https://unpkg.com/hls.js@1.0.12/dist/hls.min.js"
            />
          </>
        )}
      </Head>
      <MainPage guests={guests} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res: LiveServerResponse = context.res;
  return {
    props: { guests: res.guests },
  };
};
