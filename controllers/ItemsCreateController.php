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

class ItemsCreateController implements ControllerInterface
{
	public function validateInput(): Validator
	{
		return Validator::key('title', Validator::stringType()->notEmpty())
			->key('url', Validator::url()->setName('URL'))
			->key('description', Validator::stringType()->setName('Description'))
			->key('comments', Validator::stringType()->setName('Notes'))
			->key('image', Validator::optional(Validator::url())->setName('Image URL'))
			->key('tags', Validator::arrayType()->setName('Tags'));
	}

	public function __invoke(array $input): ResponseInterface
	{
		$repository = ServiceContainer::get(Repository::class);

		// Handle tags
		$new_tag_ids = array_map('intval', $input['tags']);
		$tags = $repository->getTags();
		$exising_tag_ids = array_keys($tags);
		if (array_diff($new_tag_ids, $exising_tag_ids)) {
			throw new ValidationException('Non-existing tags provided');
		}

		// Save item in DB
		$url = $input['url'];
		$title = $input['title'];
		$description = $input['description'];
		$image = $input['image'];
		$comments = $input['comments'];

		$item_id = $repository->createItem($title, $description, $url, $comments, $image);

		if (!$item_id) {
			throw new DataWriteException('Item creation failed');
		}

		$result = $repository->setItemTags($new_tag_ids, $item_id);

		if (!$result) {
			throw new DataWriteException('Setting item tags failed');
		}

		return success('Item created successfully', [
			'item_id' => $item_id,
		]);
	}
}