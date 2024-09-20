export const replaceEnterToBr = (originContent: string) => {
  return originContent.split(/(\n)/).map((text) => {
    if (text !== "\n") {
      return text;
    }
    return <br />;
  });
};
