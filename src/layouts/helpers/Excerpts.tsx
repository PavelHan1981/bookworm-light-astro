import React, { useState, useEffect } from "react";

const excerpts = [
  {
    text: "当我沉默着的时候，我觉得充实；我将开口，同时感到空虚。",
    author: "鲁迅",
  },
  {
    text: "凡事都有偶然的凑巧，结果却又若有宿命的必然。",
    author: "沈从文",
  },
  {
    text: "从前的日色变得慢，车，马，邮件都慢，一生只够爱一个人。",
    author: "木心",
  },
];

const Excerpts = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % excerpts.length);
        setFade(true);
      }, 500); // Wait for fade out
    }, 5000); // Change excerpt every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-20 text-center">
      <div
        className={`transition-opacity duration-1000 ${fade ? "opacity-100" : "opacity-0"}`}
      >
        <p className="mb-6 text-2xl font-serif italic leading-relaxed text-dark md:text-3xl lg:text-4xl">
          “{excerpts[index].text}”
        </p>
        <p className="text-lg text-text md:text-xl">—— {excerpts[index].author}</p>
      </div>
    </div>
  );
};

export default Excerpts;
