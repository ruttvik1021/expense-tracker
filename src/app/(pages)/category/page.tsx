import dynamic from "next/dynamic";
const Category = dynamic(() => import("@/components/category"), { ssr: false });

const Categories = () => {
  return (
    <>
      <Category />
    </>
  );
};

export default Categories;
