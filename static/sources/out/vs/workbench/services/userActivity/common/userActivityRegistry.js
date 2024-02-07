/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.userActivityRegistry = void 0;
    class UserActivityRegistry {
        constructor() {
            this.todo = [];
            this.add = (ctor) => {
                this.todo.push(ctor);
            };
        }
        take(userActivityService, instantiation) {
            this.add = ctor => instantiation.createInstance(ctor, userActivityService);
            this.todo.forEach(this.add);
            this.todo = [];
        }
    }
    exports.userActivityRegistry = new UserActivityRegistry();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckFjdGl2aXR5UmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyQWN0aXZpdHkvY29tbW9uL3VzZXJBY3Rpdml0eVJlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxNQUFNLG9CQUFvQjtRQUExQjtZQUNTLFNBQUksR0FBNEQsRUFBRSxDQUFDO1lBRXBFLFFBQUcsR0FBRyxDQUFDLElBQTJELEVBQUUsRUFBRTtnQkFDNUUsSUFBSSxDQUFDLElBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDO1FBT0gsQ0FBQztRQUxPLElBQUksQ0FBQyxtQkFBeUMsRUFBRSxhQUFvQztZQUMxRixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUMzRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDaEIsQ0FBQztLQUNEO0lBRVksUUFBQSxvQkFBb0IsR0FBRyxJQUFJLG9CQUFvQixFQUFFLENBQUMifQ==