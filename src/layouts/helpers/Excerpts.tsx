import React, { useState, useEffect } from "react";

const excerpts = [
  {
    text: "What I cannot create, I do not understand.",
    author: "Richard Feynman",
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
  },
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
  },
  {
    text: "The art of debugging is figuring out what you really told your program to do rather than what you thought you told it to do.",
    author: "Andrew Singer",
  },
  {
    text: "Controlling complexity is the essence of computer programming.",
    author: "Brian Kernighan",
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
      }, 2000); // Wait for full fade out
    }, 7000); // Total cycle: 2s fade out + index change + fade in + display time

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-10 pb-4 text-center">
      <div
        className={`transition-opacity duration-2000 ${fade ? "opacity-100" : "opacity-0"}`}
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
