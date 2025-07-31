<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { toast } from "vue-sonner";

interface Photo {
  id: string;
  title?: string;
  slug: string;
  url: string;
  tags?: string[];
  height: number;
  width?: number;
  approved: boolean;
  rejected: boolean;
  featured: boolean;
  userId: string;
  user?: {
    username: string;
    picture?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const {
  data: photos,
  status,
  error,
  refresh,
} = await useFetch<Photo[]>("/api/photo/get-all");

const handleApprove = async (photoId: string) => {
  try {
    const response: any = await $fetch(`/api/photo/${photoId}/approve`, {
      method: "POST",
    });

    if (response.success) {
      toast.success("Photo approved successfully");
      // Update the photo status in the local data
      const photo = photos.value?.find((p) => p.id === photoId);
      if (photo) {
        photo.approved = true;
        photo.rejected = false;
      }
    }
  } catch (error) {
    toast.error("Failed to approve photo");
    console.error("Error approving photo:", error);
  }
};

const handleReject = async (photoId: string) => {
  try {
    const response: any = await $fetch(`/api/photo/${photoId}/reject`, {
      method: "POST",
    });

    if (response.success) {
      toast.success("Photo rejected successfully");
      // Update the photo status in the local data
      const photo = photos.value?.find((p) => p.id === photoId);
      if (photo) {
        photo.approved = false;
        photo.rejected = true;
      }
    }
  } catch (error) {
    toast.error("Failed to reject photo");
    console.error("Error rejecting photo:", error);
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-foreground">Admin Dashboard</h1>
      <p class="text-muted-foreground">Manage and review photo submissions</p>
    </div>

    <div
      v-if="status === 'pending'"
      class="flex justify-center items-center h-64"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
      ></div>
    </div>

    <div
      v-else-if="status === 'error'"
      class="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6"
    >
      <p class="text-destructive font-medium">
        Error loading photos: {{ error }}
      </p>
      <Button @click="refresh" variant="outline" class="mt-2">Retry</Button>
    </div>

    <div v-else-if="status === 'success' && photos?.length">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div class="relative">
            <img
              :src="photo.url"
              :alt="photo.title || 'Photo'"
              class="w-full h-64 object-cover"
            />
            <div class="absolute top-2 right-2 flex gap-2">
              <span
                v-if="photo.approved"
                class="bg-green-500 text-white text-xs px-2 py-1 rounded-full"
              >
                Approved
              </span>
              <span
                v-else-if="photo.rejected"
                class="bg-red-500 text-white text-xs px-2 py-1 rounded-full"
              >
                Rejected
              </span>
              <span
                v-else
                class="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full"
              >
                Pending
              </span>
            </div>
          </div>

          <div class="p-4">
            <h3 class="font-semibold text-foreground truncate">
              {{ photo.title || "Untitled" }}
            </h3>

            <div class="flex items-center mt-2 mb-4">
              <div
                v-if="photo.user?.picture"
                class="w-8 h-8 rounded-full overflow-hidden mr-2"
              >
                <img
                  :src="photo.user.picture"
                  :alt="photo.user.username"
                  class="w-full h-full object-cover"
                />
              </div>
              <span class="text-sm text-muted-foreground"
                >@{{ photo.user?.username || "Unknown user" }}</span
              >
            </div>

            <div class="flex justify-between gap-2">
              <Button
                @click="handleApprove(photo.id)"
                :disabled="photo.approved"
                :variant="photo.approved ? 'secondary' : 'default'"
                size="sm"
                class="flex-1"
              >
                {{ photo.approved ? "Approved" : "Approve" }}
              </Button>
              <Button
                @click="handleReject(photo.id)"
                :disabled="photo.rejected"
                :variant="photo.rejected ? 'secondary' : 'destructive'"
                size="sm"
                class="flex-1"
              >
                {{ photo.rejected ? "Rejected" : "Reject" }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <div class="text-muted-foreground mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 mx-auto opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-foreground mb-2">
        No photos found
      </h3>
      <p class="text-muted-foreground">
        There are no photos to review at the moment.
      </p>
    </div>
  </div>
</template>
