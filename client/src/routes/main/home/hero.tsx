//   {
//     src: "/images/Component19.svg",
//     alt: "Techstudio Academy graduate holding certificate",
//   },
//   {
//     src: "/images/Component20.svg",
//     alt: "Techstudio Academy graduates holding certificates",
//   },
//   {
//     src: "/images/Component21.svg",
//     alt: "Techstudio Academy graduates holding certificates",
//   },
//   {
//     src: "/images/Component22.svg",
//     alt: "Techstudio Academy graduates holding certificates",
//   },
//   {
//     src: "/images/Component23.svg",
//     alt: "Techstudio Academy graduate holding certificate",
//   },
// ];

export default function Hero() {
  return (
    <section className="py-20 bg-deepBlue text-white">
      <div className="mx-auto max-w-7xl px-4 pt-17.25 pb-1 sm:px-6 lg:px-25">
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl uppercase">
          500+ Student Projects Built, Countless Careers Launched
        </h1>
        <p className="mt-4 max-w-2xl text-[#A3A3A3]">
          With 1,000+ learners trained and hundreds of real-world projects
          shipped, this archive showcases what happens when ambition meets
          practical tech education.
        </p>

        <a href="https://www.techstudioacademy.com/register" rel="noopener noreferrer">
          <button
          className="mt-6 h-10 rounded-md bg-[#FCFDFF] font-medium px-6 text-sm text-mainBlue text-[16px] hover:bg-white/90"
        >
          Join Us Now
        </button>
        </a>

        {/* <div className="mt-10 grid grid-cols-2 gap-3 sm:flex sm:gap-3">
          {GRADUATE_PHOTOS.map((photo) => (
            <img
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              className="aspect-4/3 w-full rounded-lg object-cover sm:h-44 sm:w-auto"
            />
          ))}
        </div> */}

        {/* <div className="bg-[url('/images/Rectangle.svg')] w-full">
          <div>
            <img src="/images/Component18.svg" alt="student" />
          </div>
          <div></div>
        </div> */}
      </div>

      <img
        src="/images/students.svg"
        className="block w-full py-12.5"
        alt=""
      />
    </section>
  );
}
