import { safeDecode, slugifyTaxonomy } from "@/lib/utils/textConverter";

const taxonomyFilter = (posts: any[], name: string, key: any) => {
  const target = safeDecode(typeof key === "string" ? key : "");

  return posts.filter((post) => {
    const terms = post.data?.[name];
    if (!Array.isArray(terms)) return false;
    return terms.map((term: string) => slugifyTaxonomy(term)).includes(target);
  });
};

export default taxonomyFilter;
