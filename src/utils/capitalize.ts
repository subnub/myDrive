const capitalize = (name: string) => {
  if (name.length <= 1) {
    return name.toUpperCase();
  } else {
    return name.substring(0, 1).toUpperCase() + name.substring(1);
  }
};

export default capitalize;
