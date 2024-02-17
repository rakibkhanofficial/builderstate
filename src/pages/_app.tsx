import { type Session } from "next-auth";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { type AppType } from "next/app";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {  NextUIProvider } from "@nextui-org/react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from "~@/_redux/store/store";
import { useEffect } from "react";
import { endPoints } from "~@/utils/api/route";
import { postMethod } from "~@/utils/api/postMethod";
import { useAppDispatch, useAppSelector } from "~@/_redux/hooks/hooks";
import { handleErros } from "~@/modules/auth/_redux/actions/login-auth-actions";

import "../styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <NextThemesProvider defaultTheme="system" attribute="class">
        <NextUIProvider>
          <Provider store={store}>
            <Main>
              <Component {...pageProps} />
            </Main>
            <Toaster />
          </Provider>
        </NextUIProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
};

export default MyApp;

const Main = ({ children }: { children: React.ReactNode }) => {
  const theme = useAppSelector((state) => state?.theme?.themeToggle?.dark);
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleLogin = async () => {
      try {
        if (session?.user.id) {
          const response = await postMethod({
            route: endPoints.auth.login,
            postData: {
              strEmailOrPhone: session?.user.email,
              strPassword: session?.user.id,
            },
          });
          const responseData = response?.data;
          if (responseData) {
            dispatch(
              handleErros(
                "loginError",
                responseData?.error || responseData?.message,
              ),
            );
          } else {
            dispatch(handleErros("loginError", ""));
            await signIn("credentials", {
              ...responseData,
              redirect: false,
            });
          }
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    };

    handleLogin();
  }, [session, dispatch]);

  return <div className={`${theme ? "dark" : ""}`}>{children}</div>;
};
