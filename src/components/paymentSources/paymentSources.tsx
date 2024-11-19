"use client";
import React from "react";
import PageHeader from "../common/Pageheader";
import CustomAddIcon from "../icons/customAddIcon";
import CustomDeleteIcon from "../icons/customDeleteIcon";
import CustomEditIcon from "../icons/customEditIcon";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { useSourceMutation } from "./hooks/useSourcesMutation";
import { useSourceById, useSources } from "./hooks/useSourcesQuery";

const initialEditSource = {
  id: "",
  source: "",
};

const PaymentSources = () => {
  const { data: paymentSources, refetch } = useSources();
  const { addSource, editSource, deleteSource } = useSourceMutation();
  const [deleteSourceId, setDeleteSourceId] = React.useState<string>("");
  const [editSourceId, setEditSourceId] = React.useState(initialEditSource);
  const [createSource, setCreateSource] = React.useState<string>("");

  const { data: sourceById } = useSourceById(editSourceId.id);

  React.useEffect(() => {
    if (sourceById) {
      setEditSourceId({
        id: sourceById._id,
        source: sourceById.source,
      });
    }
  }, [sourceById]);

  const handleAddSource = async () => {
    await addSource.mutateAsync(createSource);
    setCreateSource("");
    refetch();
  };

  const handleEditSource = async () => {
    await editSource.mutateAsync({
      id: editSourceId.id,
      source: editSourceId.source,
    });
    setEditSourceId(initialEditSource);
    refetch();
  };

  const handleDeleteSource = async (id: string) => {
    await deleteSource.mutateAsync(id);
    setDeleteSourceId("");
    refetch();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between my-3">
        <PageHeader title={"Payment Sources"} />
        <div className="flex gap-3">
          <Input
            type="text"
            id="category"
            placeholder="Source Name"
            value={createSource}
            onChange={(e) => setCreateSource(e.target.value)}
            disabled={addSource.isPending}
          />
          <CustomAddIcon onClick={handleAddSource} type="TEXT" disabled={!createSource}/>
        </div>
      </div>
      <Separator />
      <div className="grid gap-4">
        {paymentSources?.map((source, index) => (
          <div
            className="flex items-center justify-between rounded-sm border border-selected p-4"
            key={index}
          >
            <div className="flex items-center space-x-4">
              <div>
                <p className="font-medium">
                  {deleteSourceId === source._id ? (
                    <span className="mr-2 text-red-600">
                      Are you sure you want to delete {source.source}?
                    </span>
                  ) : editSourceId.id === source._id ? (
                    <Input
                      value={editSourceId.source}
                      onChange={(e) =>
                        setEditSourceId((prev) => ({
                          ...prev,
                          source: e.target.value,
                        }))
                      }
                      className="max-w-sm"
                    />
                  ) : (
                    source.source
                  )}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {deleteSourceId === source._id ? (
                <>
                  <CustomAddIcon
                    onClick={() => handleDeleteSource(source._id)}
                    tooltip="Confirm"
                    type="TEXT"
                  />
                  <CustomDeleteIcon
                    onClick={() => setDeleteSourceId("")}
                    tooltip="Cancel"
                    type="TEXT"
                  />
                </>
              ) : editSourceId.id === source._id ? (
                <>
                  <CustomAddIcon
                    onClick={handleEditSource}
                    tooltip="Update"
                    type="TEXT"
                  />
                  <CustomDeleteIcon
                    onClick={() => setEditSourceId(initialEditSource)}
                    tooltip="Cancel"
                    type="TEXT"
                  />
                </>
              ) : (
                <>
                  <CustomEditIcon
                    onClick={() =>
                      setEditSourceId({
                        id: source._id,
                        source: source.source,
                      })
                    }
                    tooltip="Edit"
                    type="TEXT"
                  />
                  <CustomDeleteIcon
                    onClick={() => setDeleteSourceId(source._id)}
                    tooltip="Delete"
                    type="TEXT"
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentSources;
