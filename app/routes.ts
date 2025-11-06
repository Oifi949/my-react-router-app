import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("/login", "routes/login.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("/create", "components/create.tsx"),
  route("/signup", "routes/signup.tsx"),
  route("/complete-profile", "routes/complete-profile.tsx"),
  layout("routes/layout.tsx", [index("routes/home.tsx")]),
] satisfies RouteConfig;
