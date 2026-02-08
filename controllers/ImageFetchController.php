<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Responses\MediaResponse;
use Framework\Responses\ResponseInterface;
use Respect\Validation\Validator;
use function Utils\getImageLocalPath;
use function Utils\getLocalFileContents;
use function Utils\getRemoteImageContents;
use function Utils\saveImageToLocalPath;

class ImageFetchController implements ControllerInterface
{
	public function validateInput(): Validator
	{
		return Validator::key('image-url', Validator::url()->setName('Image URL'))
			->key('item-id', Validator::stringType(), false);
	}

	public function __invoke(array $input): ResponseInterface
	{
		$image_url = $input['image-url'];
		$item_id = $input['item-id'] ?? null;

		// Get from local cache if item id is provided
		if ($item_id) {
			$image_local_path = getImageLocalPath($image_url, $item_id);
			$contents = getLocalFileContents($image_local_path);
			if ($contents) {
				return new MediaResponse($contents, 60 * 24 * 7 /*7 days*/);
			}
		}

		// Fetch the image from the URL
		try {
			$contents = getRemoteImageContents($image_url);
		} catch (\Exception) {
			return new MediaResponse('', $item_id ? 60 : 0); // Return empty response on failure and cache for 1 hour if not preview
		}

		// Save contents to file if item id is provided
		if ($item_id) {
			$image_local_path = getImageLocalPath($image_url, $item_id);
			saveImageToLocalPath($image_local_path, $contents);
			return new MediaResponse($contents, 60 * 24 * 7 /*7 days*/);
		}

		// Do not cache if no item id is provided - it's a preview
		return new MediaResponse($contents, 0);
	}
}