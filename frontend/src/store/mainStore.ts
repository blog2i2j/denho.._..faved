import { makeAutoObservable } from 'mobx';
import { toast } from 'sonner';
import { API_ENDPOINTS } from './api';
import {
  ActionType,
  CreateUserType,
  ItemType,
  LoginType,
  TagFilterType,
  TagsObjectType,
  TagType,
  UpdatePasswordType,
  UpdateUsernameType,
  UserType,
} from '@/lib/types.ts';
import { getCookie } from '@/lib/utils.ts';

class mainStore {
  items: ItemType[] = [];
  tags: TagsObjectType = [];
  type: ActionType = '' as ActionType;
  user: UserType | null = null;
  idItem: number | undefined = undefined;
  isAuthRequired = null;
  isSetupRequired = null;
  error: string | null = null;
  isOpenSettingsModal: boolean = false;
  preSelectedItemSettingsModal: string | null = null;
  tagFilter: TagFilterType = null; // Default to null for no tag selected. 'none' for without any tags
  isShowEditModal: boolean = false;
  appInfo: {
    installed_version: string | null;
    latest_version: string | null;
    update_available: boolean | null;
  } | null = null;

  constructor() {
    makeAutoObservable(this); // Makes state observable and actions transactional
  }

  runRequest = (
    endpoint: string,
    method: string,
    bodyData: object | FormData,
    defaultErrorMessage: string,
    skipSuccessMessage: boolean = false,
    skipErrorMessage: boolean = false
  ) => {
    const options = {
      method: method,
      headers: {
        Accept: 'application/json',
        'X-CSRF-TOKEN': getCookie('CSRF-TOKEN'),
      },
    };

    if (!(bodyData instanceof FormData)) {
      options['headers']['Content-Type'] = 'application/json';
    }
    if (method !== 'GET' && method !== 'HEAD') {
      options['body'] = bodyData instanceof FormData ? bodyData : JSON.stringify(bodyData);
    }

    return fetch(endpoint, options)
      .then((response) => {
        this.setIsAuthRequired(response.status === 401);

        this.setIsSetupRequired(response.status === 424);

        if (response.ok) {
          return response.json();
        }

        return response.json().then((data) => {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        });
      })
      .then((data) => {
        if (typeof data.message !== 'undefined' && !skipSuccessMessage) {
          toast.success(data.message, { position: 'top-center' });
        }
        return data;
      })
      .catch((reason) => {
        if (!skipErrorMessage) {
          toast.error(reason instanceof Error ? reason.message : defaultErrorMessage, {
            position: 'top-center',
          });
        }

        return null;
      });
  };
  setIsSetupRequired = (val: boolean) => {
    this.isSetupRequired = val;
  };
  setTagFilter = (val: TagFilterType) => {
    this.tagFilter = val;
  };
  setUser = (user: UserType) => {
    this.user = user;
  };

  unsetUser = () => {
    this.user = null;
  };
  setIsShowEditModal = (val: boolean) => {
    this.isShowEditModal = val;
  };
  setTags = (tags: TagsObjectType) => {
    const renderTagSegment = (tag: TagType) => {
      let output = '';
      if (tag.parent !== 0) {
        const parentTag = Object.values(tags).find((t) => t.id === tag.parent);
        if (parentTag) {
          output += renderTagSegment(parentTag) + '/';
        }
      }
      output += tag.title.replaceAll('/', '\\/');
      return output;
    };

    for (const tagID in tags) {
      const tag = tags[tagID];
      tag.fullPath = renderTagSegment(tag);
      tag.pinned = !!tag.pinned;
    }

    this.tags = tags as TagsObjectType;
  };
  setIsAuthRequired = (val: boolean) => {
    this.isAuthRequired = val;
  };
  fetchTags = async () => {
    return this.runRequest(API_ENDPOINTS.tags.list, 'GET', {}, 'Error fetching tags').then((data) => {
      if (data === null) {
        return;
      }
      this.setTags(data);
    });
  };
  createTag = async (title: string): Promise<number | null> => {
    let tagID = null;

    await this.runRequest(API_ENDPOINTS.tags.create, 'POST', { title }, 'Error creating tag')
      .then((data) => {
        tagID = (data?.data?.tag_id as number) || null;
      })
      .finally(() => {
        this.fetchTags();
      });

    return tagID;
  };
  onDeleteTag = async (tagID: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) {
      return;
    }

    return this.runRequest(API_ENDPOINTS.tags.deleteTag(tagID), 'DELETE', {}, 'Error deleting tag').finally(() => {
      this.fetchTags();
      this.fetchItems();
    });
  };
  onChangeTagTitle = async (tagID: number, title: string) => {
    this.runRequest(API_ENDPOINTS.tags.updateTitle(tagID), 'PATCH', { title }, 'Error updating tag title').finally(
      () => {
        this.fetchTags();
      }
    );
  };
  onChangeTagColor = async (tagID: number, color: string) => {
    return this.runRequest(
      API_ENDPOINTS.tags.updateColor(tagID),
      'PATCH',
      { color },
      'Error updating tag color'
    ).finally(() => {
      const tag = { ...this.tags[tagID], color };
      this.tags = { ...this.tags, [tagID]: tag };
    });
  };
  onChangeTagPinned = async (tagID: number, pinned: boolean) => {
    return this.runRequest(
      API_ENDPOINTS.tags.updatePinned(tagID),
      'PATCH',
      { pinned },
      'Error updating tag pinned'
    ).finally(() => {
      const tag = { ...this.tags[tagID], pinned };
      this.tags = { ...this.tags, [tagID]: tag };
    });
  };

  setItems = (val: ItemType[]) => {
    this.items = val;
  };
  setType = (val: ActionType) => {
    this.type = val;
  };
  setIdItem = (val: number) => {
    this.idItem = val;
  };
  setIsOpenSettingsModal = (val: boolean) => {
    this.isOpenSettingsModal = val;
  };
  setPreSelectedItemSettingsModal = (val: string) => {
    this.preSelectedItemSettingsModal = val;
  };
  fetchItems = async () => {
    return await this.runRequest(API_ENDPOINTS.items.list, 'GET', {}, 'Failed to fetch items').then((data) => {
      if (data === null) {
        return;
      }
      this.setItems(data);
    });
  };
  deleteItems = async (itemIds: number[]) => {
    return await this.runRequest(
      API_ENDPOINTS.items.deleteItems,
      'POST',
      {
        'item-ids': itemIds,
      },
      'Failed to delete item'
    );
  };
  refetchItemsMetadata = async (itemIds: number[]) => {
    return await this.runRequest(
      API_ENDPOINTS.items.refetchItemsMetadata,
      'POST',
      {
        'item-ids': itemIds,
      },
      'Failed to fetch metadata'
    );
  };
  updateItemsTags = async ({
    itemIds,
    newSelectedTagsAll,
    newSelectedTagsSome,
  }: {
    itemIds: number[];
    newSelectedTagsAll: string[];
    newSelectedTagsSome: string[];
  }) => {
    return await this.runRequest(
      API_ENDPOINTS.items.updateItemsTags,
      'PATCH',
      {
        'item-ids': itemIds,
        'tag-ids-all': newSelectedTagsAll.map((id) => parseInt(id, 10)),
        'tag-ids-some': newSelectedTagsSome.map((id) => parseInt(id, 10)),
      },
      'Failed to update items tags'
    );
  };
  createItem = async (data: ItemType, skipSuccessMessage: boolean = false) => {
    data.url = encodeURI(decodeURI(data.url));
    data.image = encodeURI(decodeURI(data.image));

    return this.runRequest(API_ENDPOINTS.items.createItem, 'POST', data, 'Failed to create item', skipSuccessMessage);
  };
  updateItem = async (data: ItemType, itemId, forceImageRefetch: boolean) => {
    data.url = encodeURI(decodeURI(data.url));
    data.image = encodeURI(decodeURI(data.image));

    return this.runRequest(
      API_ENDPOINTS.items.updateItem(itemId),
      'PATCH',
      {
        ...data,
        ...{ 'force-image-refetch': forceImageRefetch },
      } as ItemType & { 'force-image-refetch': boolean },
      'Failed to update item'
    );
  };
  getUser = async (noErrorEmit: boolean = false) => {
    const response = await this.runRequest(
      API_ENDPOINTS.settings.getUser,
      'GET',
      {},
      'Failed to fetch user',
      true,
      noErrorEmit
    );

    if (!response?.data?.user) {
      return false;
    }
    this.setUser(response.data.user);
    return true;
  };

  createUser = async (values: CreateUserType) => {
    const response = await this.runRequest(API_ENDPOINTS.settings.create, 'POST', values, 'Failed to create user');

    if (response === null || !response?.data?.user) {
      return false;
    }

    this.setUser(response.data.user);
    return true;
  };

  updateUsername = async (values: UpdateUsernameType) => {
    const response = await this.runRequest(
      API_ENDPOINTS.settings.userName,
      'PATCH',
      values,
      'Failed to update username'
    );

    if (response === null) {
      return false;
    }

    this.setUser({ ...this.user, ...{ username: values.username } });
    return true;
  };

  updatePassword = async (values: UpdatePasswordType) => {
    const response = await this.runRequest(
      API_ENDPOINTS.settings.password,
      'PATCH',
      values,
      'Failed to update password'
    );
    if (response === null) {
      return false;
    }
    return true;
  };

  deleteUser = () => {
    return this.runRequest(API_ENDPOINTS.settings.delete, 'DELETE', {}, 'Failed to delete user').then((response) => {
      if (response === null) {
        return;
      }
      this.unsetUser();
    });
  };
  logOut = () => {
    return this.runRequest(API_ENDPOINTS.auth.logout, 'POST', {}, 'Failed to log out').then((response) => {
      if (response === null) {
        return;
      }
      this.setIsAuthRequired(true);
    });
  };

  login = async (values: LoginType) => {
    const response = await this.runRequest(API_ENDPOINTS.auth.login, 'POST', values, 'Failed to log in');

    if (response === null || !response?.data?.user) {
      return;
    }

    this.setIsAuthRequired(false);
    this.setUser(response.data.user);
  };
  initializeDatabase = async () => {
    return this.runRequest(API_ENDPOINTS.setup.setup, 'POST', {}, 'Failed to initialize database').then((response) => {
      if (response === null) {
        return false;
      }
      this.setIsAuthRequired(false);
      this.setIsSetupRequired(false);
      return true;
    });
  };
  importPocketBookmarks = async (selectedFile: File, setIsLoading: (val: boolean) => void) => {
    return this.importBookmarks(selectedFile, setIsLoading, 'pocket-zip', API_ENDPOINTS.importBookmarks.pocket);
  };

  importBrowserBookmarks = async (selectedFile: File, setIsLoading: (val: boolean) => void) => {
    return this.importBookmarks(selectedFile, setIsLoading, 'browser-html', API_ENDPOINTS.importBookmarks.browser);
  };
  importBookmarks = async (
    selectedFile: File,
    setIsLoading: (val: boolean) => void,
    inputName: string,
    endpointUrl: string
  ) => {
    const formData = new FormData();
    formData.append(inputName, selectedFile);

    setIsLoading(true);

    return this.runRequest(endpointUrl, 'POST', formData, 'Failed to import bookmarks')
      .then((response) => {
        if (response === null) {
          return false;
        }
        this.setIsOpenSettingsModal(false);
        this.fetchItems();
        this.fetchTags();
        return true;
      })
      .finally(() => setIsLoading(false));
  };

  fetchUrlMetadata = async (url: string) => {
    return this.runRequest(
      '/api/url/fetch-metadata',
      'POST',
      { url: encodeURI(decodeURI(url)) },
      'Error fetching metadata from URL'
    );
  };

  getAppInfo = async () => {
    const response = await this.runRequest(API_ENDPOINTS.appInfo, 'GET', {}, 'Error fetching app info', true, true);

    if (response === null || !response.data) {
      return;
    }

    this.appInfo = response.data;
    return response.data;
  };
}

export default new mainStore();
