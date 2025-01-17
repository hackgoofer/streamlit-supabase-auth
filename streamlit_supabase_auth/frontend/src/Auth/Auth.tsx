import React, { useEffect, useRef, useState } from "react";
import { SupabaseClient, Provider } from "@supabase/supabase-js";
import {
  Input,
  Checkbox,
  Button,
  Space,
  Typography,
  Divider,
  IconKey,
  IconMail,
  IconInbox,
  IconLock,
} from "@supabase/ui";
import { Auth as SupabaseAuth } from "@supabase/ui";
import * as SocialIcons from "./Icons";
import AuthStyles from "./Auth.module.css";

const { UserContextProvider, useUser } = SupabaseAuth;

const VIEWS: ViewsMap = {
  SIGN_IN: "sign_in",
  SIGN_UP: "sign_up",
  FORGOTTEN_PASSWORD: "forgotten_password",
  MAGIC_LINK: "magic_link",
  UPDATE_PASSWORD: "update_password",
};

interface ViewsMap {
  [key: string]: ViewType;
}

type ViewType =
  | "sign_in"
  | "sign_up"
  | "forgotten_password"
  | "magic_link"
  | "update_password";

type RedirectTo = undefined | string;

export interface Props {
  supabaseClient: SupabaseClient;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  socialLayout?: "horizontal" | "vertical";
  socialColors?: boolean;
  socialButtonSize?: "tiny" | "small" | "medium" | "large" | "xlarge";
  providers?: Provider[];
  verticalSocialLayout?: any;
  view?: ViewType;
  redirectTo?: RedirectTo;
  onlyThirdPartyProviders?: boolean;
  magicLink?: boolean;
  onError?: () => void;
}

function Auth({
  supabaseClient,
  className,
  style,
  onError,
  socialLayout = "vertical",
  socialColors = false,
  socialButtonSize = "medium",
  providers,
  view = "sign_in",
  redirectTo,
  onlyThirdPartyProviders = false,
  magicLink = false,
}: Props): JSX.Element | null {
  const [authView, setAuthView] = useState(view);
  const [defaultEmail, setDefaultEmail] = useState("");
  const [defaultPassword, setDefaultPassword] = useState("");

  const verticalSocialLayout = socialLayout === "vertical" ? true : false;

  let containerClasses = [AuthStyles["sbui-auth"]];
  if (className) {
    containerClasses.push(className);
  }

  const Container = (props: any) => (
    <div className={containerClasses.join(" ")} style={style}>
      <Space size={8} direction={"vertical"}>
        <SocialAuth
          supabaseClient={supabaseClient}
          verticalSocialLayout={verticalSocialLayout}
          providers={providers}
          socialLayout={socialLayout}
          socialButtonSize={socialButtonSize}
          socialColors={socialColors}
          redirectTo={redirectTo}
          onlyThirdPartyProviders={onlyThirdPartyProviders}
          magicLink={magicLink}
        />
        {!onlyThirdPartyProviders && props.children}
      </Space>
    </div>
  );

  useEffect(() => {
    // handle view override
    setAuthView(view);
  }, [view]);

  switch (authView) {
    case VIEWS.SIGN_IN:
    case VIEWS.SIGN_UP:
      return (
        <Container>
          <EmailAuth
            id={authView === VIEWS.SIGN_UP ? "auth-sign-up" : "auth-sign-in"}
            supabaseClient={supabaseClient}
            authView={authView}
            setAuthView={setAuthView}
            defaultEmail={defaultEmail}
            defaultPassword={defaultPassword}
            setDefaultEmail={setDefaultEmail}
            setDefaultPassword={setDefaultPassword}
            redirectTo={redirectTo}
            magicLink={magicLink}
            onError={onError}
          />
        </Container>
      );
    case VIEWS.FORGOTTEN_PASSWORD:
      return (
        <Container>
          <ForgottenPassword
            supabaseClient={supabaseClient}
            setAuthView={setAuthView}
            redirectTo={redirectTo}
          />
        </Container>
      );

    case VIEWS.MAGIC_LINK:
      return (
        <Container>
          <MagicLink
            supabaseClient={supabaseClient}
            setAuthView={setAuthView}
            redirectTo={redirectTo}
          />
        </Container>
      );

    case VIEWS.UPDATE_PASSWORD:
      return (
        <Container>
          <UpdatePassword supabaseClient={supabaseClient} />
        </Container>
      );

    default:
      return null;
  }
}

function SocialAuth({
  className,
  style,
  supabaseClient,
  children,
  socialLayout = "vertical",
  socialColors = false,
  socialButtonSize,
  providers,
  verticalSocialLayout,
  redirectTo,
  onlyThirdPartyProviders,
  magicLink,
  ...props
}: Props) {
  const buttonStyles: any = {
    azure: {
      backgroundColor: "#008AD7",
      color: "white",
    },
    bitbucket: {
      backgroundColor: "#205081",
      color: "white",
    },
    facebook: {
      backgroundColor: "#4267B2",
      color: "white",
    },
    github: {
      backgroundColor: "#333",
      color: "white",
    },
    gitlab: {
      backgroundColor: "#FC6D27",
    },
    google: {
      backgroundColor: "#ce4430",
      color: "white",
    },
    twitter: {
      backgroundColor: "#1DA1F2",
      color: "white",
    },
    apple: {
      backgroundColor: "#000",
      color: "white",
    },
    discord: {
      backgroundColor: "#404fec",
      color: "white",
    },
    twitch: {
      backgroundColor: "#9146ff",
      color: "white",
    },
  };
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");

  const handleProviderSignIn = async (provider: Provider) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: redirectTo },
      })

      if (error) throw error;
      // _top target requires sandbox="allow-top-navigation"
      window.open(data.url);
    } catch (e) {
      console.log(error)
      setError(error);
    }
    setLoading(false);
  };

  return (
    <Space size={8} direction={"vertical"}>
      {providers && providers.length > 0 && (
        <React.Fragment>
          <Space size={4} direction={"vertical"}>
            <Typography.Text
              type="secondary"
              className={AuthStyles["sbui-auth-label"]}
            >
              Sign in with
            </Typography.Text>
            <Space size={2} direction={socialLayout}>
              {providers.map((provider) => {
                // @ts-ignore
                const AuthIcon = SocialIcons[provider];
                return (
                  <div
                    key={provider}
                    style={!verticalSocialLayout ? { flexGrow: 1 } : {}}
                  >
                    <Button
                      block
                      type="default"
                      shadow
                      size={socialButtonSize}
                      style={socialColors ? buttonStyles[provider] : {}}
                      icon={AuthIcon ? <AuthIcon /> : ""}
                      loading={loading}
                      onClick={() => handleProviderSignIn(provider)}
                      className="flex items-center"
                    >
                      {verticalSocialLayout && "Sign up with " + provider}
                    </Button>
                  </div>
                );
              })}
            </Space>
          </Space>
          {!onlyThirdPartyProviders && <Divider>or continue with</Divider>}
        </React.Fragment>
      )}
    </Space>
  );
}

function EmailAuth({
  authView,
  defaultEmail,
  defaultPassword,
  id,
  setAuthView,
  setDefaultEmail,
  setDefaultPassword,
  supabaseClient,
  redirectTo,
  magicLink,
  onError,
}: {
  authView: ViewType;
  defaultEmail: string;
  defaultPassword: string;
  id: "auth-sign-up" | "auth-sign-in";
  setAuthView: any;
  setDefaultEmail: (email: string) => void;
  setDefaultPassword: (password: string) => void;
  supabaseClient: SupabaseClient;
  redirectTo?: RedirectTo;
  magicLink?: boolean;
  onError?: () => void;
}) {
  const isMounted = useRef<boolean>(true);
  const [email, setEmail] = useState(defaultEmail);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(defaultPassword);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (error && onError) {
      onError();
    }
  }, [onError, error]);

  useEffect(() => {
    setEmail(defaultEmail);
    setPassword(defaultPassword);

    return () => {
      isMounted.current = false;
    };
  }, [authView, defaultEmail, defaultPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    switch (authView) {
      case "sign_in":
        // sasha: need to redirect to redirectTo
        const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
          },
        );
        if (signInError) setError(signInError.message);
        break;
      case "sign_up":
        const {
          data: signUpUser,
          error: signUpError,
        } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
              emailRedirectTo: redirectTo,
              data: {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
              }
            },
          }
        );

        if (signUpError) setError(signUpError.message);
        // Check if session is null -> email confirmation setting is turned on
        else if (signUpUser && signUpUser.user && !signUpUser.session)
          setMessage("Check your email for the confirmation link.");
        break;
    }

    /*
     * it is possible the auth component may have been unmounted at this point
     * check if component is mounted before setting a useState
     */
    if (isMounted.current) setLoading(false);
  };

  const handleViewChange = (newView: ViewType) => {
    setDefaultEmail(email);
    setDefaultPassword(password);
    setAuthView(newView);
  };

  return (
    <form id={id} onSubmit={handleSubmit}>
      <Space size={6} direction={"vertical"}>
        <Space size={3} direction={"vertical"}>
          <Input
            label="Email address"
            autoComplete="email"
            defaultValue={email}
            icon={<IconMail size={21} stroke={"#666666"} />}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
          <Input
            label="Password"
            type="password"
            defaultValue={password}
            autoComplete="current-password"
            icon={<IconKey size={21} stroke={"#666666"} />}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
          {id === "auth-sign-up" && (
            <div>
            <Input
              label="First name"
              type="text"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFirstName(e.target.value)
              }
              />
              <Input
              label="Last name"
              type="text"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLastName(e.target.value)
              }
              />
              <Input
              label="Phone number"
              type="number"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPhone(e.target.value)
              }
              />
            </div>
          )}
        </Space>
        <Space direction="vertical" size={6}>
          <Space style={{ justifyContent: "space-between" }}>
            <Checkbox
              label="Remember me"
              name="remember_me"
              id="remember_me"
              onChange={(value: React.ChangeEvent<HTMLInputElement>) =>
                setRememberMe(value.target.checked)
              }
            />
            {authView === VIEWS.SIGN_IN && (
              <Typography.Link
                href="#auth-forgot-password"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  setAuthView(VIEWS.FORGOTTEN_PASSWORD);
                }}
              >
                Forgot your password?
              </Typography.Link>
            )}
          </Space>
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            icon={<IconLock size={21} />}
            loading={loading}
            block
          >
            {authView === VIEWS.SIGN_IN ? "Sign in" : "Sign up"}
          </Button>
        </Space>
        <Space direction="vertical" style={{ textAlign: "center" }}>
          {authView === VIEWS.SIGN_IN && magicLink && (
            <Typography.Link
              href="#auth-magic-link"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                setAuthView(VIEWS.MAGIC_LINK);
              }}
            >
              Sign in with magic link
            </Typography.Link>
          )}
          {authView === VIEWS.SIGN_IN ? (
            <Typography.Link
              href="#auth-sign-up"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                handleViewChange(VIEWS.SIGN_UP);
              }}
            >
              Don't have an account? Sign up
            </Typography.Link>
          ) : (
            <Typography.Link
              href="#auth-sign-in"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                handleViewChange(VIEWS.SIGN_IN);
              }}
            >
              Do you have an account? Sign in
            </Typography.Link>
          )}
          {message && <Typography.Text>{message}</Typography.Text>}
          {error && <Typography.Text type="danger">{error}</Typography.Text>}
        </Space>
      </Space>
    </form>
  );
}

function MagicLink({
  setAuthView,
  supabaseClient,
  redirectTo,
}: {
  setAuthView: any;
  supabaseClient: SupabaseClient;
  redirectTo?: RedirectTo;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMagicLinkSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithOtp({email: email, options: {
      emailRedirectTo: redirectTo
    }});
    if (error) setError(error.message);
    else setMessage("Check your email for the magic link");
    setLoading(false);
  };

  return (
    <form id="auth-magic-link" onSubmit={handleMagicLinkSignIn}>
      <Space size={4} direction={"vertical"}>
        <Space size={3} direction={"vertical"}>
          <Input
            label="Email address"
            placeholder="Your email address"
            icon={<IconMail size={21} stroke={"#666666"} />}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
          <Button
            block
            size="large"
            htmlType="submit"
            icon={<IconInbox size={21} />}
            loading={loading}
          >
            Send magic link
          </Button>
        </Space>
        <Typography.Link
          href="#auth-sign-in"
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            setAuthView(VIEWS.SIGN_IN);
          }}
        >
          Sign in with password
        </Typography.Link>
        {message && <Typography.Text>{message}</Typography.Text>}
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </Space>
    </form>
  );
}

function ForgottenPassword({
  setAuthView,
  supabaseClient,
  redirectTo,
}: {
  setAuthView: any;
  supabaseClient: SupabaseClient;
  redirectTo?: RedirectTo;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error } = await supabaseClient.auth.resetPasswordForEmail(
      email,
      { redirectTo: redirectTo}
    );
    if (error) setError(error.message);
    else setMessage("Check your email for the password reset link");
    setLoading(false);
  };

  return (
    <form id="auth-forgot-password" onSubmit={handlePasswordReset}>
      <Space size={4} direction={"vertical"}>
        <Space size={3} direction={"vertical"}>
          <Input
            label="Email address"
            placeholder="Your email address"
            icon={<IconMail size={21} stroke={"#666666"} />}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
          <Button
            block
            size="large"
            htmlType="submit"
            icon={<IconInbox size={21} />}
            loading={loading}
          >
            Send reset password instructions
          </Button>
        </Space>
        <Typography.Link
          href="#auth-sign-in"
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            setAuthView(VIEWS.SIGN_IN);
          }}
        >
          Go back to sign in
        </Typography.Link>
        {message && <Typography.Text>{message}</Typography.Text>}
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </Space>
    </form>
  );
}

function UpdatePassword({
  supabaseClient,
}: {
  supabaseClient: SupabaseClient;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error } = await supabaseClient.auth.updateUser({ password: password });
    if (error) setError(error.message);
    else setMessage("Your password has been updated");
    setLoading(false);
  };

  return (
    <form id="auth-update-password" onSubmit={handlePasswordReset}>
      <Space size={4} direction={"vertical"}>
        <Space size={3} direction={"vertical"}>
          <Input
            label="New password"
            placeholder="Enter your new password"
            type="password"
            icon={<IconKey size={21} stroke={"#666666"} />}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
          <Button
            block
            size="large"
            htmlType="submit"
            icon={<IconKey size={21} />}
            loading={loading}
          >
            Update password
          </Button>
        </Space>
        {message && <Typography.Text>{message}</Typography.Text>}
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </Space>
    </form>
  );
}

Auth.ForgottenPassword = ForgottenPassword;
Auth.UpdatePassword = UpdatePassword;
Auth.MagicLink = MagicLink;
Auth.UserContextProvider = UserContextProvider;
Auth.useUser = useUser;

export default Auth;
