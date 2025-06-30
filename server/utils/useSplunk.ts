export const useSplunk = async (
  to: string,
  from: string,
  subject: string,
  body: string
) => {
  const runtimeConfig = useRuntimeConfig();
  const response = await $fetch(
    `${runtimeConfig.public.splunkUrl}/api/v1/email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": runtimeConfig.public.splunkApiKey,
      },
      body: {
        to,
        from,
        subject,
        body,
      },
    }
  );
  return response;
};
