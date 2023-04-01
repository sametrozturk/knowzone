/* eslint-env jest */
const mongoose = require('mongoose');
const PostRepository = require('../../src/post/PostRepository');
const POST_SCHEMA_CONFIGS = require('../../src/post/postSchemaConfigs');
const FORM_SCHEMA_CONFIGS = require('../../src/form/formSchemaConfigs');
const FormRepository = require('../../src/form/FormRepository');
const VALIDATION_MESSAGES = require('../../src/common/validationMessages');
const MONGOOSE_DEFAULT_MESSAGES = require('../../src/common/mongooseDefaultMessages');
const POST_VALIDATION_MESSAGES = require('../../src/post/postValidationMessages');
const FORM_COMPONENT_TYPES = require('../../src/form/formComponentTypes');

const postRepository = new PostRepository();
const formRepository = new FormRepository();

function createInvalid(post) {
  return async () => { await postRepository.create(post); };
}

async function create(post) {
  const result = await postRepository.create(post);
  const { _id, __v, createdAt, updatedAt, ...data } = result.toObject();
  data.owner.id = data.owner.id.toString();
  return data;
}

const myType = 'my type';
const notMyType = 'not my type';

const myForm = {
  type: myType,
  owner: {
    id: '222222222222222222222222',
    username: 'john_doe',
    name: 'John Doe',
  },
  content: {
    textInput: FORM_COMPONENT_TYPES.TEXT,
    editorInput: FORM_COMPONENT_TYPES.EDITOR,
    listInput: FORM_COMPONENT_TYPES.LIST,
    images: FORM_COMPONENT_TYPES.IMAGE,
  },
};

const notMyForm = {
  type: notMyType,
  owner: {
    id: '555555555555555555555555',
    username: 'john_doe2',
    name: 'John Doe',
  },
  content: {
    textInput: FORM_COMPONENT_TYPES.TEXT,
    editorInput: FORM_COMPONENT_TYPES.EDITOR,
    listInput: FORM_COMPONENT_TYPES.LIST,
    images: FORM_COMPONENT_TYPES.IMAGE,
  },
};

const ownerMock = { id: '222222222222222222222222', username: 'john_doe', name: 'John Doe' };

const topicsMock = ['1', '2'];

const contentMock = {
  textInput: 'a text',
  editorInput: 'this is an editor',
  listInput: ['item1', 'item2'],
  images: [{ name: 'screenshot.png', path: 'images/screenshot.png' }],
};

const postMock = { type: myType, owner: ownerMock, topics: topicsMock, content: contentMock };

beforeAll(async () => {
  await formRepository.create(myForm);
  await formRepository.create(notMyForm);
});

beforeEach(async () => {
  const postsCollection = mongoose.connection?.collections?.posts;

  if (postsCollection) {
    await postsCollection.deleteMany({});
  }
});

describe('PostRepository.create() with invalid records', () => {
  const postWithoutOwner = { type: myType, topics: topicsMock, content: contentMock };

  const postWithoutOwnerId = {
    owner: {
      username: 'john',
      name: 'john',
    },
    type: myType,
    topics: topicsMock,
    content: contentMock,
  };

  const postWithoutType = { owner: ownerMock, topics: topicsMock, content: contentMock };

  const postWithMoreThanMaxContentField = {
    ...postMock,
    content: {
      1: 'a text',
      2: 'a text',
      3: 'a text',
      4: 'a text',
      5: 'a text',
      6: 'a text',
      7: 'a text',
      8: 'a text',
      9: 'a text',
      10: 'a text',
      11: 'a text',
    },
  };

  const postWithoutContentField = { ...postMock, content: {} };

  const postWithUndefinedContent = { owner: ownerMock, type: myType, topics: topicsMock };

  const postWithInvalidMaxLenType = {
    ...postMock,
    type: (new Array(FORM_SCHEMA_CONFIGS.MAX_LEN_TYPE + 10)).join('-'),
  };

  const postWithInvalidMinLenType = {
    ...postMock,
    type: (new Array(FORM_SCHEMA_CONFIGS.MIN_LEN_TYPE - 1)).join('-'),
  };

  const postWithInvalidTypeOfType = { ...postMock, type: [1, 2] };

  const postWithInvalidTypeOfContentFields = { ...postMock, content: [1, 2] };

  const postWithZeroTopic = { ...postMock, topics: [] };

  const postWithoutTopic = { type: myType, owner: ownerMock, content: contentMock };

  const postWithInvalidMaxTopic = {
    ...postMock,
    topics: [...Array(POST_SCHEMA_CONFIGS.MAX_NUM_TOPICS + 1).keys()],
  };

  const postWithInvalidMaxLenTopic = {
    ...postMock,
    topics: [(new Array(POST_SCHEMA_CONFIGS.MAX_LEN_TOPIC + 2)).join('a')],
  };

  const postWithInvalidTopic = {
    ...postMock,
    topics: ['...'],
  };

  const postWithDuplicatedTopics = {
    ...postMock,
    topics: ['1', '2', '1'],
  };

  const postOfNonExistingForm = { ...postMock, type: 'no type' };

  const postWithInvalidMinLenTextValue = {
    ...postMock,
    content: {
      textInput: (new Array(POST_SCHEMA_CONFIGS.MIN_LEN_TEXT - 1)).join('-'),
    },
  };

  const postWithInvalidMaxLenTextValue = {
    ...postMock,
    content: {
      textInput: (new Array(POST_SCHEMA_CONFIGS.MAX_LEN_TEXT + 2)).join('-'),
    },
  };

  const postWithInvalidTextValue = { ...postMock, content: { textInput: null } };

  const postWithInvalidList = { ...postMock, content: { textInput: 'a text', listInput: null } };

  const postWithInvalidListLen = {
    ...postMock,
    content: {
      textInput: 'a text',
      listInput: new Array(POST_SCHEMA_CONFIGS.MAX_NUM_LIST + 1),
    },
  };

  const postWithInvalidEditorValue = { ...postMock, content: { editorInput: null } };

  const postWithInvalidMaxLenEditorValue = {
    ...postMock,
    content: {
      editorInput: new Array(POST_SCHEMA_CONFIGS.MAX_LEN_EDITOR + 1),
    },
  };

  const postWithInvalidMinLenEditorValue = {
    ...postMock,
    content: {
      editorInput: new Array(POST_SCHEMA_CONFIGS.MIN_LEN_EDITOR - 1),
    },
  };

  const postWithInvalidMultipleComponentValue = {
    ...postMock,
    content: {
      textInput: 'a text',
      editorInput: [1, 2],
      listInput: false,
    },
  };

  const postWithNonExistingFormField = {
    ...postMock,
    content: {
      textInput: 'a text',
      images: new Array(POST_SCHEMA_CONFIGS.MAX_NUM_IMAGES + 1).fill().map((_, i) => (
        { name: `screenshot${i}.png`, path: `images/screenshot${i}.png` }
      )),
      nonExist: 'value',
    },
  };

  const postOfNotMyForm = { ...postMock, type: notMyType };

  it('should throw error when model is empty', async () => {
    await expect(createInvalid({})).rejects.toThrow(MONGOOSE_DEFAULT_MESSAGES.INVALID('Post'));
  });

  it('should throw error when there is no owner', async () => {
    await expect(createInvalid(postWithoutOwner)).rejects.toThrow(
      MONGOOSE_DEFAULT_MESSAGES.REQUIRED('owner.id'),
    );
  });

  it('should throw error when there is no owner.id', async () => {
    await expect(createInvalid(postWithoutOwnerId)).rejects.toThrow(
      MONGOOSE_DEFAULT_MESSAGES.REQUIRED('owner.id'),
    );
  });

  it('should throw error when there is no type', async () => {
    await expect(createInvalid(postWithoutType)).rejects.toThrow(
      MONGOOSE_DEFAULT_MESSAGES.REQUIRED('type'),
    );
  });

  it('should throw error when there are more than max fields in content', async () => {
    await expect(createInvalid(postWithMoreThanMaxContentField)).rejects.toThrow(
      VALIDATION_MESSAGES.MAX_KEY('content', FORM_SCHEMA_CONFIGS.MAX_NUM_CONTENT),
    );
  });

  it('should throw error when there is less than 1 field in content', async () => {
    await expect(createInvalid(postWithoutContentField)).rejects.toThrow(
      VALIDATION_MESSAGES.MIN_KEY('content', FORM_SCHEMA_CONFIGS.MIN_NUM_CONTENT),
    );
  });

  it('should throw error when content is undefined', async () => {
    await expect(createInvalid(postWithUndefinedContent)).rejects.toThrow(
      MONGOOSE_DEFAULT_MESSAGES.REQUIRED('content'),
    );
  });

  it('should throw error when len of type is longer than max len', async () => {
    await expect(createInvalid(postWithInvalidMaxLenType)).rejects.toThrow(
      VALIDATION_MESSAGES.MAX_LEN('type', FORM_SCHEMA_CONFIGS.MAX_LEN_TYPE),
    );
  });

  it('should throw error when len of type is shorter than min len', async () => {
    await expect(createInvalid(postWithInvalidMinLenType)).rejects.toThrow(
      MONGOOSE_DEFAULT_MESSAGES.REQUIRED('type'),
    );
  });

  it('should throw error when type is not string', async () => {
    const castMessage = MONGOOSE_DEFAULT_MESSAGES.CAST('string');

    await expect(createInvalid(postWithInvalidTypeOfType)).rejects.toThrow(castMessage);

    postWithInvalidTypeOfType.type = {};
    await expect(createInvalid(postWithInvalidTypeOfType)).rejects.toThrow(castMessage);
  });

  it('should throw error when content is not object', async () => {
    const typeMessage = VALIDATION_MESSAGES.TYPE('content', 'object');

    await expect(createInvalid(postWithInvalidTypeOfContentFields)).rejects.toThrow(typeMessage);

    postWithInvalidTypeOfContentFields.content = 'test';
    await expect(createInvalid(postWithInvalidTypeOfContentFields)).rejects.toThrow(typeMessage);

    postWithInvalidTypeOfContentFields.content = 5.1;
    await expect(createInvalid(postWithInvalidTypeOfContentFields)).rejects.toThrow(typeMessage);

    postWithInvalidTypeOfContentFields.content = null;
    await expect(createInvalid(postWithInvalidTypeOfContentFields)).rejects.toThrow(
      MONGOOSE_DEFAULT_MESSAGES.REQUIRED('content'),
    );
  });

  it('should throw error when there is 0 topic', async () => {
    await expect(createInvalid(postWithZeroTopic)).rejects.toThrow(
      VALIDATION_MESSAGES.MIN_NUM('topics', POST_SCHEMA_CONFIGS.MIN_NUM_TOPICS),
    );
  });

  it('should throw error when there is no topic', async () => {
    await expect(createInvalid(postWithoutTopic)).rejects.toThrow(
      VALIDATION_MESSAGES.MIN_NUM('topics', POST_SCHEMA_CONFIGS.MIN_NUM_TOPICS),
    );
  });

  it('should throw error when len of topics is longer than max', async () => {
    await expect(createInvalid(postWithInvalidMaxTopic)).rejects.toThrow(
      VALIDATION_MESSAGES.MAX_NUM('topics', POST_SCHEMA_CONFIGS.MAX_NUM_TOPICS),
    );
  });

  it('should throw error when len of topic is invalid', async () => {
    await expect(createInvalid(postWithInvalidMaxLenTopic)).rejects.toThrow(
      POST_VALIDATION_MESSAGES.INVALID_TOPIC,
    );
  });

  it('should throw error when there is invalid value in topics', async () => {
    await expect(createInvalid(postWithInvalidTopic)).rejects.toThrow(
      POST_VALIDATION_MESSAGES.INVALID_TOPIC,
    );
  });

  it('should throw error when there are duplicated items in topics', async () => {
    await expect(createInvalid(postWithDuplicatedTopics)).rejects.toThrow(
      VALIDATION_MESSAGES.DUPLICATED_ITEMS,
    );
  });

  it('should throw error when there is no form for the type in post', async () => {
    await expect(createInvalid(postOfNonExistingForm)).rejects.toThrow(
      VALIDATION_MESSAGES.NO_RECORD('form'),
    );
  });

  it('should throw error when value of text component is shorter than min len', async () => {
    await expect(createInvalid(postWithInvalidMinLenTextValue)).rejects.toThrow(
      VALIDATION_MESSAGES.MIN_LEN('textInput', POST_SCHEMA_CONFIGS.MIN_LEN_TEXT),
    );
  });

  it('should throw error when value of text component is longer than max len', async () => {
    await expect(createInvalid(postWithInvalidMaxLenTextValue)).rejects.toThrow(
      VALIDATION_MESSAGES.MAX_LEN('textInput', POST_SCHEMA_CONFIGS.MAX_LEN_TEXT),
    );
  });

  it('should throw error when value of text component is invalid', async () => {
    const message = POST_VALIDATION_MESSAGES.VALUE(
      'textInput',
      FORM_COMPONENT_TYPES.TEXT,
      'string, number or boolean',
    );

    await expect(createInvalid(postWithInvalidTextValue)).rejects.toThrow(message);
    postWithInvalidTextValue.content.textInput = { a: 'test' };
    await expect(createInvalid(postWithInvalidTextValue)).rejects.toThrow(message);
    postWithInvalidTextValue.content.textInput = [1, 2, 3, 4];
    await expect(createInvalid(postWithInvalidTextValue)).rejects.toThrow(message);
  });

  it('should throw error when value of list component is not array', async () => {
    const message = POST_VALIDATION_MESSAGES.VALUE('listInput', FORM_COMPONENT_TYPES.LIST, 'array');

    await expect(createInvalid(postWithInvalidList)).rejects.toThrow(message);
    postWithInvalidList.content.listInput = { 1: 2 };
    await expect(createInvalid(postWithInvalidList)).rejects.toThrow(message);
    postWithInvalidList.content.listInput = 1234;
    await expect(createInvalid(postWithInvalidList)).rejects.toThrow(message);
    postWithInvalidList.content.listInput = false;
    await expect(createInvalid(postWithInvalidList)).rejects.toThrow(message);
    postWithInvalidList.content.listInput = 'asd';
    await expect(createInvalid(postWithInvalidList)).rejects.toThrow(message);
  });

  it('should throw error when len of list component is longer than max', async () => {
    await expect(createInvalid(postWithInvalidListLen)).rejects.toThrow(
      VALIDATION_MESSAGES.MAX_NUM('listInput', POST_SCHEMA_CONFIGS.MAX_NUM_LIST),
    );
  });

  it('should throw error when value of editor component is invalid', async () => {
    const message = POST_VALIDATION_MESSAGES.VALUE(
      'editorInput',
      FORM_COMPONENT_TYPES.EDITOR,
      'string, number or boolean',
    );

    await expect(createInvalid(postWithInvalidEditorValue)).rejects.toThrow(message);
    postWithInvalidEditorValue.content.editorInput = {};
    await expect(createInvalid(postWithInvalidEditorValue)).rejects.toThrow(message);
    postWithInvalidEditorValue.content.editorInput = [1, 2, 3];
    await expect(createInvalid(postWithInvalidEditorValue)).rejects.toThrow(message);
  });

  it('should throw error when len of editor component is longer than max', async () => {
    await expect(createInvalid(postWithInvalidMaxLenEditorValue)).rejects.toThrow(
      VALIDATION_MESSAGES.MAX_LEN('editorInput', POST_SCHEMA_CONFIGS.MAX_LEN_EDITOR),
    );
  });

  it('should throw error when len of editor component is shorter than min', async () => {
    await expect(createInvalid(postWithInvalidMinLenEditorValue)).rejects.toThrow(
      VALIDATION_MESSAGES.MIN_LEN('editorInput', POST_SCHEMA_CONFIGS.MIN_LEN_EDITOR),
    );
  });

  it('should throw error when values of multiple components are invalid', async () => {
    const messages = [
      `${POST_VALIDATION_MESSAGES.VALUE(
        'editorInput',
        FORM_COMPONENT_TYPES.EDITOR,
        'string, number or boolean',
      )}`,
      `${POST_VALIDATION_MESSAGES.VALUE('listInput', FORM_COMPONENT_TYPES.LIST, 'array')}`,
    ];

    await expect(createInvalid(postWithInvalidMultipleComponentValue)).rejects.toThrow(
      messages.join(', '),
    );
  });

  it('should throw error when field of post is not exist in associated form ', async () => {
    await expect(createInvalid(postWithNonExistingFormField)).rejects.toThrow(
      POST_VALIDATION_MESSAGES.INVALID_FIELD,
    );
  });

  it('should throw error when trying to create post with not owned form', async () => {
    await expect(createInvalid(postOfNotMyForm)).rejects.toThrow(
      VALIDATION_MESSAGES.NO_RECORD('form'),
    );
  });
});

describe('PostRepository.create() with valid records', () => {
  const postWithOnlyText = { ...postMock, content: { textInput: 'a text' } };

  const postWithOnlyImage = {
    ...postMock,
    content: {
      images: [
        { name: 'screenshot1.png', path: 'images/screenshot1.png' },
        { name: 'screenshot2.png', path: 'images/screenshot2.png' },
      ],
    },
  };

  const postWithEachTypeOfComponent = { ...postMock };

  it('should create post when form type is exist and belongs to post owner', async () => {
    await expect(await create(postWithOnlyText)).toEqual(postWithOnlyText);
  });

  it('should create post with only images', async () => {
    await expect(await create(postWithOnlyImage)).toEqual(postWithOnlyImage);
  });

  it('should create post with all the fields in form', async () => {
    await expect(await create(postWithEachTypeOfComponent)).toEqual(postWithEachTypeOfComponent);
  });
});

describe('PostRepository.find()', () => {
  it('should return empty list when there is no post', async () => {
    const result = await postRepository.find();
    expect(result).toEqual([]);
  });

  it('should return empty list when there is no post for current user', async () => {
    await Promise.all([
      create(postMock),
      create(postMock),
      create(postMock),
    ]);

    const result = await postRepository.find({ 'owner.id': '222222222222662222222222' });
    expect(result).toEqual([]);
  });

  it('should return only posts with the given type', async () => {
    const postWithNotMyType = { ...postMock, type: notMyType, owner: notMyForm.owner };

    await Promise.all([
      create(postMock),
      create(postWithNotMyType),
    ]);

    const result = await postRepository.find({ 'owner.id': postMock.owner.id, type: myType });
    expect(result.every((obj) => obj.type === myType)).toBe(true);
  });
});

describe('PostRepository.findOne()', () => {
  it('should return empty post when there is no condition', async () => {
    const result = await postRepository.findOne();
    expect(result).toEqual(null);
  });

  it('should return post with given owner id', async () => {
    const postWithDiffOwner = { ...postMock, type: notMyType, owner: notMyForm.owner };

    await Promise.all([
      create(postMock),
      create(postWithDiffOwner),
    ]);

    const result = await postRepository.findOne({ 'owner.id': postMock.owner.id });
    expect(result.owner.id.toString() === postMock.owner.id).toBe(true);
  });

  it('should return post with given type', async () => {
    const postWithNotMyType = { ...postMock, type: notMyType, owner: notMyForm.owner };

    await Promise.all([
      create(postMock),
      create(postWithNotMyType),
    ]);

    const result = await postRepository.findOne({ type: postMock.type });
    expect(result.type === postMock.type).toBe(true);
  });

  it('should return post with given type and owner id', async () => {
    const postWithNotMyType = { ...postMock, type: notMyType, owner: notMyForm.owner };

    await Promise.all([
      create(postMock),
      create(postWithNotMyType),
    ]);

    const result = await postRepository.findOne(
      { 'owner.id': postMock.owner.id, type: postMock.type },
    );

    expect(result.type === postMock.type
      && result.owner.id.toString() === postMock.owner.id).toBe(true);
  });
});

describe('PostRepository.deleteMany()', () => {
  it('should return empty after delete for given owner id', async () => {
    const postWithNotMyType = { ...postMock, type: notMyType, owner: notMyForm.owner };

    await Promise.all([
      create(postMock),
      create(postMock),
      create(postMock),
      create(postWithNotMyType),
      create(postWithNotMyType),
    ]);

    await postRepository.deleteMany({ 'owner.id': postMock.owner.id });

    await expect(await postRepository.find({ 'owner.id': postMock.owner.id })).toEqual([]);
  });

  it('should return empty array after delete for given owner id', async () => {
    const postWithNotMyType = { ...postMock, type: notMyType, owner: notMyForm.owner };

    await Promise.all([
      create(postMock),
      create(postMock),
      create(postMock),
      create(postWithNotMyType),
      create(postWithNotMyType),
    ]);

    await postRepository.deleteMany({ 'owner.id': postMock.owner.id });

    const myTypePostsAfterDeletion = await postRepository.find({ 'owner.id': postMock.owner.id });
    const notMyTypePostsAfterDeletion = await postRepository.find({ 'owner.id': postWithNotMyType.owner.id });

    expect(myTypePostsAfterDeletion).toHaveLength(0);
    expect(notMyTypePostsAfterDeletion).toHaveLength(2);
  });

  it('should return empty array after delete for given filter values', async () => {
    const postWithDiffContent = { ...postMock,
      content: { ...contentMock, textInput: 'b text',
      } };

    await Promise.all([
      create(postMock),
      create(postMock),
      create(postMock),
      create(postWithDiffContent),
      create(postWithDiffContent),
      create(postWithDiffContent),
    ]);

    await postRepository.deleteMany({ 'content.textInput': 'a text' });

    const myPostsAfterDeletion = await postRepository.find({ 'content.textInput': postMock.content.textInput });
    const myPostsWithDiffContentAfterDeletion = await postRepository.find({ 'content.textInput': postWithDiffContent.content.textInput });

    expect(myPostsAfterDeletion).toHaveLength(0);
    expect(myPostsWithDiffContentAfterDeletion).toHaveLength(3);
  });
});