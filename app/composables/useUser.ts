interface AppUser {
  id?: string;
  name?: string | null;
  username?: string | null;
  picture?: string | null;
  role?: string | null;
}

export const useUser = () => {
  const user = useState<AppUser | null>("user", () => null);

  const getUser = async () => {
    try {
      const { data } = await useFetch<AppUser>("/api/user", {
        server: false,
      });
      user.value = data.value ?? null;
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
