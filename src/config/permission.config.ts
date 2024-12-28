import { ActionList, ResourceList } from '@core/constants/app.constant';
import { ROLE } from '@core/constants/entity.enum';

export interface RolePayload {
  name: string;
  description?: string;
  permissions: Array<PermissionPayload>;
}

export interface PermissionPayload {
  resource: ResourceList;
  actions: Array<ActionList>;
}

export const PermissionConfiguration: Array<RolePayload> = [
  {
    name: ROLE.ADMIN,
    description: 'Administrator of the system',
    permissions: [
      {
        resource: ResourceList.USER,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.READ_ALL,
          ActionList.UPDATE,
          ActionList.UPDATE_ANY,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.ROLE,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.READ_ALL,
          ActionList.UPDATE,
          ActionList.UPDATE_ANY,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.PERMISSION,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.READ_ALL,
          ActionList.UPDATE,
          ActionList.UPDATE_ANY,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.QUIZZFLY,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.READ_ALL,
          ActionList.UPDATE,
          ActionList.UPDATE_ANY,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.ROOM,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.READ_ALL,
          ActionList.UPDATE,
          ActionList.UPDATE_ANY,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.GROUP,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.READ_ALL,
          ActionList.UPDATE,
          ActionList.UPDATE_ANY,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.NOTIFICATION,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.READ_ALL,
          ActionList.UPDATE,
          ActionList.UPDATE_ANY,
          ActionList.DELETE,
        ],
      },
    ],
  },
  {
    name: ROLE.MODERATOR,
    description: 'Moderator of the system',
    permissions: [
      {
        resource: ResourceList.USER,
        actions: [
          ActionList.READ,
          ActionList.READ_ALL,
          ActionList.UPDATE,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.ROLE,
        actions: [ActionList.READ, ActionList.READ_ALL],
      },
      {
        resource: ResourceList.PERMISSION,
        actions: [ActionList.READ, ActionList.READ_ALL],
      },
      {
        resource: ResourceList.QUIZZFLY,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.READ_ALL,
          ActionList.UPDATE,
          ActionList.UPDATE_ANY,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.ROOM,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.READ_ALL,
          ActionList.UPDATE,
          ActionList.UPDATE_ANY,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.GROUP,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.READ_ALL,
          ActionList.UPDATE,
          ActionList.UPDATE_ANY,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.NOTIFICATION,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.READ_ALL,
          ActionList.UPDATE,
          ActionList.UPDATE_ANY,
          ActionList.DELETE,
        ],
      },
    ],
  },
  {
    name: ROLE.USER,
    description: 'Normal user of the system',
    permissions: [
      {
        resource: ResourceList.USER,
        actions: [ActionList.READ, ActionList.UPDATE],
      },
      {
        resource: ResourceList.QUIZZFLY,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.UPDATE,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.ROOM,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.UPDATE,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.GROUP,
        actions: [
          ActionList.CREATE,
          ActionList.READ,
          ActionList.UPDATE,
          ActionList.DELETE,
        ],
      },
      {
        resource: ResourceList.NOTIFICATION,
        actions: [ActionList.READ, ActionList.UPDATE, ActionList.DELETE],
      },
    ],
  },
];
