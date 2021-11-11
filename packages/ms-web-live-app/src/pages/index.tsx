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
