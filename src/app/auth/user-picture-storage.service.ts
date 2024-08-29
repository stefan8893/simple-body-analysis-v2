import { Injectable, InjectionToken } from '@angular/core';
import { UserPicture } from '../stores/user-picture/user-picture.reducer';
import { addDays } from 'date-fns';

type UserPictureEntry = {
  userId: string;
  dataUrl: string;
  expiresAt: Date;
};

export const USER_PICTURE_STORAGE = new InjectionToken<UserPictureStorage>(
  'User Picture Storage Injection Token'
);

export type UserPictureStorage = {
  get: (userId: string) => Promise<UserPicture | null>;
  set: (userId: string, pictureObjectUrl: string) => Promise<void>;
};

export function useUserPictureStorage(): UserPictureStorage {
  const storageKey = 'app-user-picture';

  const get = async (userId: string): Promise<UserPicture | null> => {
    const pictureEntryRaw = localStorage.getItem(storageKey);
    if (!pictureEntryRaw) return null;

    const pictureEntry = JSON.parse(pictureEntryRaw) as UserPictureEntry;
    if (!pictureEntry) return null;

    if (pictureEntry.userId !== userId) {
      // CQS violation:
      // delete the picture instantly if it doesn't belong to the current user
      localStorage.removeItem(storageKey);

      return null;
    }

    const now = new Date();
    if (now > pictureEntry.expiresAt) {
      // CQS violation (again):
      // remove outdated entry from storage
      localStorage.removeItem(storageKey);
      return null;
    }

    const pictureBlob = await dataUrlToBlob(pictureEntry.dataUrl);

    return {
      source: 'Cache',
      objectUrl: URL.createObjectURL(pictureBlob),
    };
  };

  const set = async (
    userId: string,
    pictureObjectUrl: string
  ): Promise<void> => {
    const blob = await dataUrlToBlob(pictureObjectUrl);
    const dataUrl = await blobToBase64(blob);

    const pictureEntry: UserPictureEntry = {
      userId,
      dataUrl,
      expiresAt: addDays(new Date(), 1),
    };

    localStorage.setItem(storageKey, JSON.stringify(pictureEntry));
  };

  const dataUrlToBlob = async (dataUrl: string) => {
    const response = await fetch(dataUrl);
    return await response.blob();
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject('not supported type');
      };
    });
  };

  return {
    get,
    set,
  };
}
