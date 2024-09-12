import AddCategory from "@/components/addCategoryButton";
import Category from "@/components/category";
import PageHeader from "@/components/common/Pageheader";

const Categories = () => {
  return (
    <>
      <div className="flex justify-between mb-3">
        <PageHeader title="Category" />
        <AddCategory type={"Button"} />
      </div>
      <Category />
    </>
  );
};

export default Categories;
