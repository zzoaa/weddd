
import React, { useState } from "react";

export const Loading = () => {
  const [loading, setLoading] = useState(true);

  return loading ? (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        border: "1px solid black",
        transform: "translate(-50%, -50%)",
        padding: '10px',
      }}
    >
      Loading...
    </div>
  ) : null;
};
