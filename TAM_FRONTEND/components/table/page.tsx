import React, { useMemo } from "react";
import { Space, Table, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import "./page.scss";
export interface PoolDataType {
  [key: string]: any;
}

interface MyPositionsTableProps<T> {
  poolData: T[];
  initialColumns: any;
}
export const RenderTypeInColumn = {
  LINK: "link",
  COPY: "copy",
  BUTTON: "button",
};

const MyPositionsTable: React.FC<MyPositionsTableProps<PoolDataType>> = ({
  poolData,
  initialColumns,
}) => {
  const columnsWithRender = useMemo(
    () =>
      (initialColumns ?? []).map((col: any) => ({
        ...col,
        render: col.actions
          ? (text: string, record: any) =>
              col.actions.map((action: any, index: number) => (
                <a
                  key={index}
                  style={{ marginRight: 8, ...action.style }}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(record);
                  }}
                >
                  {action.label}
                </a>
              ))
          : col.renderType === RenderTypeInColumn.LINK
            ? () => (
                <div>
                  <a style={{ marginRight: 8 }} onClick={col.onclick}>
                    collect
                  </a>
                  <a>burn</a>
                </div>
              )
            : col.renderType === RenderTypeInColumn.BUTTON
              ? () => <Button>test</Button>
              : undefined,
      })),
    [initialColumns]
  );

  return (
    <div className="table-container">
      <Table
        columns={columnsWithRender}
        dataSource={poolData}
      
      />
    </div>
  );
};

export default MyPositionsTable;
