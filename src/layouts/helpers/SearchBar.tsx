import dateFormat from "@/lib/utils/dateFormat";
import { humanize, slugifyTaxonomy } from "@/lib/utils/textConverter";
import Fuse from "fuse.js";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BiCalendarEdit, BiCategoryAlt } from "react-icons/bi";

export type SearchItem = {
  url: string;
  title: string;
  date: string | null;
  categories: string[];
  tags: string[];
  image: string | null;
  excerpt: string;
};

interface SearchResult {
  item: SearchItem;
  refIndex: number;
}

export default function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState("");
  const [searchList, setSearchList] = useState<SearchItem[]>([]);
  const [failed, setFailed] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null,
  );

  // 索引改为构建期生成的独立 JSON，按需拉取，避免整站正文塞进页面 HTML
  useEffect(() => {
    let alive = true;
    fetch("/search-index.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: SearchItem[]) => {
        if (alive) setSearchList(data);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(searchList, {
        keys: ["title", "categories", "tags", "excerpt"],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [searchList],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

  useEffect(() => {
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr) setInputVal(searchStr);

    setTimeout(function () {
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.selectionEnd =
          searchStr?.length || 0;
      }
    }, 50);
  }, []);

  useEffect(() => {
    const inputResult = inputVal.length > 1 ? fuse.search(inputVal) : [];
    setSearchResults(inputResult);

    if (inputVal.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("q", inputVal);
      const newRelativePathQuery =
        window.location.pathname + "?" + searchParams.toString();
      history.replaceState(null, "", newRelativePathQuery);
    } else {
      history.replaceState(null, "", window.location.pathname);
    }
  }, [inputVal, fuse]);

  return (
    <div className="min-h-[45vh]">
      <input
        className="form-input w-full text-center"
        placeholder="Type here to Search posts"
        type="text"
        name="search"
        value={inputVal}
        onChange={handleChange}
        autoComplete="off"
        autoFocus
        ref={inputRef}
      />

      {failed && (
        <div className="my-6 text-center text-text">
          搜索索引加载失败，请刷新页面重试。
        </div>
      )}

      {inputVal.length > 1 && (
        <div className="my-6 text-center">
          Found {searchResults?.length}
          {searchResults?.length === 1 ? " result" : " results"} for &apos;
          {inputVal}&apos;
        </div>
      )}

      <div className="row">
        {searchResults?.map(({ item }) => (
          <div key={item.url} className={"col-12 mb-8 sm:col-6"}>
            {item.image && (
              <a
                href={item.url}
                className="rounded-lg block hover:text-primary overflow-hidden group"
              >
                <img
                  className="group-hover:scale-[1.03] transition duration-300 w-full"
                  src={item.image}
                  alt={item.title}
                  width={445}
                  height={230}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            )}

            <ul className="mt-6 mb-4 flex flex-wrap items-center text-text">
              <li className="mr-5 flex items-center flex-wrap font-medium">
                <BiCalendarEdit className="mr-1 h-5 w-5 text-gray-600" />
                <>{item.date ? dateFormat(item.date) : ""}</>
              </li>
              <li className="mr-5 flex items-center flex-wrap">
                <BiCategoryAlt className="mr-1 h-[18px] w-[18px] text-gray-600" />
                <>
                  <ul>
                    {item.categories.map((category: string, i: number) => (
                      <li key={i} className="inline-block">
                        <a
                          href={`/zh/categories/${slugifyTaxonomy(category)}`}
                          className="mr-2 hover:text-primary font-medium"
                        >
                          {humanize(category)}
                          {i !== item.categories.length - 1 && ","}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              </li>
            </ul>

            <h3 className="mb-2">
              <a
                href={item.url}
                className="block hover:text-primary transition duration-300"
              >
                {item.title}
              </a>
            </h3>
            <p className="text-text line-clamp-2">{item.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
