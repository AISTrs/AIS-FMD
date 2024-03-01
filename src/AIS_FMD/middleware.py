from django.shortcuts import redirect

class AdminLoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        if not request.user.is_authenticated:
            if request.path.startswith("/login") or request.path.startswith("/signup"):
                pass
            else:
                return redirect("/login")
        elif request.path.startswith("/admin") and not request.user.has_perm(
                "admin.access_admin"
        ):
            return redirect("/")

        return self.get_response(request)
