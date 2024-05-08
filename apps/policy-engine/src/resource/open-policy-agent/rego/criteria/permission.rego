package main

import future.keywords.every
import future.keywords.in

checkPermission(grantedPermission) {
    requestedPermission = input.permissions
    
    every permission in requestedPermission {
        permission in grantedPermission
    }
}