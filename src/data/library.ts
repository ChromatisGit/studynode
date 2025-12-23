export type LibraryStub = {
  message: string;
};

export function getLibraryStub(): LibraryStub {
  return {
    message: "Library data is stubbed until the curriculum model is integrated.",
  };
}
