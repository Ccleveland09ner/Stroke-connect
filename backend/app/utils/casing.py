"""Convert between snake_case and camelCase for API request/response normalization."""

import re


def _to_camel(s: str) -> str:
    components = s.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])


def _to_snake(s: str) -> str:
    s = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', s)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s).lower()


def to_camel_case(obj):
    """Recursively convert dict keys from snake_case to camelCase."""
    if isinstance(obj, dict):
        return {_to_camel(k): to_camel_case(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [to_camel_case(item) for item in obj]
    return obj


def from_camel_case(obj):
    """Recursively convert dict keys from camelCase to snake_case."""
    if isinstance(obj, dict):
        return {_to_snake(k): from_camel_case(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [from_camel_case(item) for item in obj]
    return obj
