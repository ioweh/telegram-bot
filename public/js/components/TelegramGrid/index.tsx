import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Select, MenuItem, Pagination } from "@mui/material";
import { IconButton, Collapse, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const TelegramGrid = (): JSX.Element => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [groupBy, setGroupBy] = useState("chatTitle");
  const [expandedRow, setExpandedRow] = useState(null);

  const handleExpandClick = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id)); // Toggle expand/collapse
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  useEffect(() => {
    fetch(`/messages?page=${page}&groupBy=${groupBy}`)
      .then((res) => res.json())
      .then(setData);
  }, [page, groupBy]);

  const columns = [
    {
      field: "_id",
      headerName: groupBy === "chatTitle" ? "Group" : "User",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Expand",
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleExpandClick(params.row.id)}
          size="small"
        >
          {expandedRow === params.row.id ? (
            <ExpandLessIcon />
          ) : (
            <ExpandMoreIcon />
          )}
        </IconButton>
      ),
    },
  ];

  return (
    <div style={{ height: 600, width: "100%" }}>
      <Select
        value={groupBy}
        onChange={(e) => {
          setExpandedRow(null);
          setGroupBy(e.target.value);
        }}
      >
        <MenuItem value="chatTitle">Group by Chat Title</MenuItem>
        <MenuItem value="senderName">Group by Sender Name</MenuItem>
      </Select>

      <DataGrid
        rows={data.map((group, index) => ({ id: index, ...group }))}
        columns={columns}
        pageSize={10}
      />

      {/* Expanded content BELOW the grid */}
      {expandedRow !== null && (
        <Box
          sx={{
            padding: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 2,
            marginTop: 2,
          }}
        >
          <h4>
            Messages for {groupBy === "chatTitle" ? "Group" : "User"}:{" "}
            {data[expandedRow]._id}
          </h4>
          {data[expandedRow].messages.map((msg, idx) => (
            <div key={idx} style={{ padding: "4px 0" }}>
              <strong>
                {groupBy === "chatTitle"
                  ? `[${msg.senderName}]`
                  : `[${msg.chatTitle}]`}
              </strong>{" "}
              {formatTimestamp(msg.timestamp)}: {msg.messageText}
            </div>
          ))}
        </Box>
      )}

      <Pagination
        count={10}
        page={page}
        onChange={(e, value) => setPage(value)}
      />
    </div>
  );
};

export default TelegramGrid;
