interface PageNavigationInfo {
  totalCount: number;
  totalPages: number;
  page: number;
  listCount: number;
}

interface PostListResponse {
  items: any[];
  pagination: PageNavigationInfo;
}