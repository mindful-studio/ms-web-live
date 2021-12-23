import theme from "../theme";
import { ThemeProvider, Global, css } from "@emotion/react";

function Theme({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          @font-face {
            font-family: "af";
            font-weight: 1 1000;
            src: url(${require("!!base64-inline-loader!../fonts/aftp.woff2")})
              format("woff2");
          }

          body {
            font-family: "af";
            -webkit-tap-highlight-color: transparent;
          }

          svg,
          img {
            vertical-align: top;
          }
        `}
      />
      {children}
    </ThemeProvider>
  );
}

export default Theme;
