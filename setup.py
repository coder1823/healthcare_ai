from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in healthcare_ai/__init__.py
from healthcare_ai import __version__ as version

setup(
	name="healthcare_ai",
	version=version,
	description="healthcare with Ai and Ml ",
	author="kaviraj P R",
	author_email="coder.1823@gmail.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
