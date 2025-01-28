'use client';
import { IconButton, Tooltip } from "@mui/material";
import React, { useState } from "react";

type CopyButtonProps = {
  tooltip: string;
  preClicked: React.ReactElement;
  postClicked: React.ReactElement;
  toCopy: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ tooltip, preClicked, postClicked, toCopy }) => {

  const [clicked, setClicked] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(toCopy);
    setClicked(true);

    setTimeout(() => {
      setClicked(false);
    }, 1000);
  }

  return (
    <Tooltip title={tooltip}>
      <IconButton size="small" style={{ padding: 0 }} onClick={handleCopy}>
        {!clicked ? preClicked : postClicked}
      </IconButton>
    </Tooltip>
  )
};