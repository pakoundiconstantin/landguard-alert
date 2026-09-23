from rest_framework.permissions import BasePermission


class HasRole(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in self.allowed_roles
        )


class IsAdmin(HasRole):
    allowed_roles = ("admin",)


class IsCadastreOrAdmin(HasRole):
    allowed_roles = ("cadastre", "admin")


class IsTribunalOrAdmin(HasRole):
    allowed_roles = ("tribunal", "admin")


class IsStaffWorkflow(HasRole):
    allowed_roles = ("admin", "cadastre", "tribunal")


class IsAnyLandguardUser(HasRole):
    allowed_roles = ("admin", "cadastre", "tribunal", "consultation")
