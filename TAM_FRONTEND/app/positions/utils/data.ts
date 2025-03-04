
export const initialPoolsColumns = [
    {
        title: "INDEX",
        dataIndex: "index",
        key: "index",
        width: "4%",
    },
    {
        title: "POOL",
        dataIndex: "pool",
        key: "pool",
    },

    {
        title: "FEES",
        dataIndex: "fee",
        key: "fee",
    },
    // {
    //   title: "Tags",
    //   key: "tags",
    //   dataIndex: "tags",
    //   render: (_, { tags }) => (
    //     <>
    //       {tags.map((tag) => {
    //         let color = tag.length > 5 ? "geekblue" : "green";
    //         if (tag === "loser") {
    //           color = "volcano";
    //         }
    //         return (
    //           <Tag color={color} key={tag}>
    //             {tag.toUpperCase()}
    //           </Tag>
    //         );
    //       })}
    //     </>
    //   ),
    // },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => (
    //     <Space size="middle">
    //       <a>Invite {record.name}</a>
    //       <a>Delete</a>
    //     </Space>
    //   ),
    // },
];
export const renderType = {
    LINK: "link",
    COPY: "copy",
    BUTTON: "button"
}
export let initialMyPositionsColumns = [
    {
        title: "INDEX",
        dataIndex: "index",
        key: "index",
        width: 100,
        fixed: 'left',
    },
    {
        title: "owner",
        dataIndex: "owner",
        key: "owner",
    },
    {
        title: "tokensOwed0",
        dataIndex: "tokensOwed0",
        key: "tokensOwed0",
    },
    {
        title: "tokensOwed1",
        dataIndex: "tokensOwed1",
        key: "tokensOwed1",
    },
    {
        title: "token0",
        dataIndex: "token0",
        key: "token0",
    },
    {
        title: "token1",
        dataIndex: "token1",
        key: "token1",

    },
    {
        title: "liquidity",
        dataIndex: "liquidity",
        key: "liquidity",
    },

]

