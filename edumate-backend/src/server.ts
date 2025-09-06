import app from "./app";
import { env } from "./config";

app.listen(env.PORT, () => {
  console.log(`EduMate backend listening on :${env.PORT}`);
});
