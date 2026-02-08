<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Exceptions\DataWriteException;
use Framework\Exceptions\ValidationException;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Repository;
use Respect\Validation\Validator;
use function Framework\success;
use function Utils\clearItemImageDirectory;

class ItemsUpdateController implements ControllerInterface
{
	public function validateInput(): Validator
	{
		return Validator::key('item-id', Validator::stringType()->notEmpty())
			->key('title', Validator::stringType()->notEmpty())
			->key('url', Validator::url()->setName('URL'))
			->key('description', Validator::stringType()->setName('Description'))
			->key('comments', Validator::stringType()->setName('Notes'))
			->key('image', Validator::optional(Validator::url())->setName('Image URL'))
			->key('tags', Validator::arrayType()->setName('Tags'))
			->key('force-image-refetch', Validator::boolType(), false);
	}

	public function __invoke(array $input): ResponseInterface
	{
		$repository = ServiceContainer::get(Repository::class);// Handle tags

		// Handle tags
		$new_tag_ids = array_map('intval', $input['tags']);
		$tags = $repository->getTags();
		$exising_tag_ids = array_keys($tags);
		if (array_diff($new_tag_ids, $exising_tag_ids)) {
			return throw new ValidationException('Non-existing tags provided');
		}

		// Save item in DB
		$item_id = $_GET['item-id'];
		$title = $input['title'];
		$description = $input['description'];
		$url = $input['url'];
		$comments = $input['comments'];
		$image = $input['image'];

		$result = $repository->updateItem($title, $description, $url, $comments, $image, $item_id);
		if (!$result) {
			throw new DataWriteException('Item update failed');
		}

		$result = $repository->setItemTags($new_tag_ids, $item_id);

		if (!$result) {
			throw new DataWriteException('Item tags update failed');
		}

		// Clear local image if needed
		if (empty($image) || !empty($input['force-image-refetch'])) {
			clearItemImageDirectory($item_id);
		}

		return success('Item updated successfully', [
			'item_id' => $item_id,
		]);
	}
}