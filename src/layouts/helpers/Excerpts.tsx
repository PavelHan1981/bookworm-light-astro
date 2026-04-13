import React, { useState, useEffect } from "react";

const excerpts = [
  {
    text: "平生不修善果,只爱杀人放火。忽地顿开金绳,这里扯断玉锁。咦!钱塘江上潮信来,今日方知我是我。",
    author: "《水浒传》",
  },
  {
    text: "六盘山上高峰，红旗漫卷西风。今日长缨在手，何时缚住苍龙？",
    author: "毛泽东",
  },
  {
    text: "白日放歌须纵酒，青春作伴好还乡。即从巴峡穿巫峡，便下襄阳向洛阳。",
    author: "杜甫",
  },
  {
    text: "汴水流，泗水流，流到瓜洲古渡头。吴山点点愁。",
    author: "白居易",
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
