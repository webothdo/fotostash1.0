export const useUser = () => {
  const user = useState("user", () => null);

  const getUser = async () => {
    try {
      const { data } = await useFetch("/api/user", {
        server: false,
      });
      // @ts-ignore
      user.value = data.value;
    } catch (error) {
      console.log(error);
      user.value = null;
    }
  };

  return {
    user,
    getUser,
  };
};
