import { useState } from 'react';
import { Dialog, DialogActions, DialogTitle, Button, styled } from '@mui/material';
import { toast } from 'react-toastify';
import Post from './Post';
import PostCreator from './PostCreator';
import ContentWrapper from '../common/ContentWrapper';
import { GRAY3, IRREVERSIBLE_ACTION, WHITE } from '../../constants/colors';
import LinearProgressModal from '../common/LinearProgressModal';
import { BE_ROUTES } from '../../constants/routes';

const isNewImage = (image) => image instanceof File;

const ContentWrapperHeaderContainer = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: 0,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  margin: theme.spacing(1, 0),
  border: `1px solid ${GRAY3}`,
  borderRadius: 4,
  backgroundColor: WHITE,
  zIndex: 100,
}));

function Posts({ title, form, posts, setPosts }) {
  const [openForUpdate, setOpenForUpdate] = useState(false);
  const [openForAdd, setOpenForAdd] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLinearProgressModalOpen, setIsLinearProgressModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState();

  const handleClose = () => setOpenDialog(false);

  const setForUpdate = (post) => {
    if (post) {
      setSelectedPost(post);
      setOpenForUpdate(true);
    }
  };

  const setForDelete = (post) => {
    if (post) {
      setSelectedPost(post);
      setOpenDialog(true);
    }
  };

  const updatePost = async (values) => {
    let isUpdatePostSuccessful = false;
    setIsLinearProgressModalOpen(true);

    try {
      const { id, content, topics, type } = values ?? {};

      if (id) {
        const idx = posts.findIndex((p) => p.id === id);

        if (idx !== -1) {
          const fd = new FormData();
          const { images, ...rest } = content;

          if (images) {
            const oldImages = [];
            (images ?? []).forEach((image) => {
              if (isNewImage(image)) {
                if (image.preview) {
                  URL.revokeObjectURL(image.preview);
                }
                fd.append('image', image);
              } else {
                oldImages.push(image);
              }
            });
            fd.append('oldImages', JSON.stringify(oldImages));
          }

          fd.append('content', JSON.stringify(rest));
          fd.append('topics', JSON.stringify(topics));

          const url = `${process.env.REACT_APP_KNOWZONE_BE_URI}/${BE_ROUTES.POSTS}/${id}`;
          const response = await fetch(url, { method: 'PUT', body: fd, credentials: 'include' });
          const result = await response.json();

          if (result?.status === 'fail') {
            toast.error(result.message);
          } else {
            const newPosts = [...posts];
            newPosts[idx] = { ...result, type };
            setPosts(newPosts);
            setOpenForUpdate(false);

            isUpdatePostSuccessful = true;
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setOpenDialog(false);
      setIsLinearProgressModalOpen(false);
    }

    return isUpdatePostSuccessful;
  };

  const deletePost = async () => {
    setIsLinearProgressModalOpen(true);

    try {
      if (selectedPost?.id) {
        const idx = posts.findIndex((p) => p.id === selectedPost.id);

        if (idx !== -1) {
          const response = await fetch(
            `${process.env.REACT_APP_KNOWZONE_BE_URI}/${BE_ROUTES.POSTS}/${selectedPost?.id}`,
            {
              headers: { 'Content-Type': 'application/json' },
              method: 'DELETE',
              credentials: 'include',
            },
          );
          const result = response.json();

          console.log(result.message);
          const newPosts = [...posts];
          newPosts.splice(idx, 1);
          setPosts(newPosts);
          setOpenDialog(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLinearProgressModalOpen(false);
    }
  };

  const addPost = async (values) => {
    let isAddPostSuccessful = false;
    setIsLinearProgressModalOpen(true);

    try {
      if (values?.type !== '') {
        const fd = new FormData();
        const { type, topics, content } = values;
        const { images, ...rest } = content ?? {};
        const filledContentFields = {};

        Object.entries(rest).forEach(([k, v]) => { if (v) filledContentFields[k] = v; });

        if (images) {
          (Array.isArray(images) ? images : []).forEach((image) => {
            if (image.preview) {
              URL.revokeObjectURL(image.preview);
            }
            fd.append('image', image);
          });
        }

        fd.append('content', JSON.stringify(filledContentFields));
        fd.append('type', JSON.stringify(type));
        fd.append('topics', JSON.stringify(topics));

        const response = await fetch(
          `${process.env.REACT_APP_KNOWZONE_BE_URI}/${BE_ROUTES.POSTS}`,
          {
            method: 'POST',
            body: fd,
            credentials: 'include',
          },
        );
        const result = await response.json();

        if (result?.status === 'fail') {
          toast.error(result?.message);
        } else {
          toast.success(result?.message);
          setOpenForAdd(false);
          isAddPostSuccessful = true;
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.message);
    } finally {
      setIsLinearProgressModalOpen(false);
    }

    return isAddPostSuccessful;
  };

  const handleConfirm = () => deletePost();

  return (
    <LinearProgressModal isOpen={isLinearProgressModalOpen}>
      <ContentWrapper
        Header={(
          <ContentWrapperHeaderContainer>
            <h2>{title}</h2>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setOpenForAdd(true)}
              size="small"
              style={{ height: 40 }}
            >
              Create Post
            </Button>
          </ContentWrapperHeaderContainer>
        )}
      >
        {Array.isArray(posts) && posts.length ? (
          posts.map((p) => (
            <Post
              key={p.id}
              showType
              editable
              content={form?.content ?? {}}
              post={p}
              onClickUpdate={() => setForUpdate(p)}
              onClickDelete={() => setForDelete(p)}
            />
          ))) : null}
      </ContentWrapper>
      {openForUpdate && (
        <PostCreator
          buttonTitle="update"
          open={openForUpdate}
          setOpen={setOpenForUpdate}
          handler={updatePost}
          form={form}
          oldPost={selectedPost}
        />
      )}
      {openForAdd && (
        <PostCreator
          buttonTitle="create"
          open={openForAdd}
          setOpen={setOpenForAdd}
          handler={addPost}
          form={form}
        />
      )}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to delete the post?
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            style={{
              backgroundColor: IRREVERSIBLE_ACTION,
              color: WHITE,
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </LinearProgressModal>
  );
}

export default Posts;
