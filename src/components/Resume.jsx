import { ProfileDescription } from "./Descriptions";
import { Skills } from "./Skills";

export default function Resume() {
  return (
    <div className="flex flex-col gap-5">

      <ProfileDescription />

      <Skills />

      <div className="grid gap-2">
        <h3 className="text-xl font-bold">Codeforces Profile</h3>
        <p className="text-sm">
          Keeping this list as this is basically what made me become
          today&apos;s me
        </p>
      </div>
    </div>
  );
}