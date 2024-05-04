export default async function useAppwriteUser() {
  const { account } = useNuxtApp().$appwrite;
  const user = useState("user", () => null);
  const curr = useUserStore();

  await callOnce(async () => {
    const data = await account.get();
    if (data) {
      user.value = data;
      curr.currentUser = data;
    } else {
      user.value = null;
      curr.currentUser = null;
    }
  });

  return user.value;
}
