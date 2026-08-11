import { Outlet } from "react-router";


export default function AuthLayout() {
  return (
    <div className="bg-[url('/bgBlue.png')] bg-cover bg-no-repeat min-h-screen flex justify-center items-center">
      <section className="m-4 md:m-8">
        <Outlet/>
      </section>
    </div>
  );
}
