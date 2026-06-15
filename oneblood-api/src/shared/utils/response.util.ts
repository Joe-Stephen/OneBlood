export const success = <T>(data: T, message?: string) => ({
  success: true,
  message,
  data,
});

export const paginated = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string,
) => ({
  success: true,
  message,
  data: {
    items: data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  },
});
