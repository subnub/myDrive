type SortOrder = 1 | -1;

interface SortBy {
  [key: string]: SortOrder;
}

const sortBySwitch = (sortBy: string): SortBy => {
  if (sortBy === "date_desc") {
    return { uploadDate: -1 };
  } else if (sortBy === "date_asc") {
    return { uploadDate: 1 };
  } else if (sortBy === "alp_desc") {
    return { filename: -1 };
  } else {
    return { filename: 1 };
  }
};

export default sortBySwitch;
