import React, { useState, useEffect, useRef } from 'react';
import FilerobotImageEditor, {
  TABS,
  TOOLS,
} from 'react-filerobot-image-editor';
import { saveAs } from 'file-saver';
import { useNavigate, useLocation } from 'react-router';
import { BiLeftArrowAlt } from 'react-icons/bi';
import { getDatabase, ref as dbRef, onValue, update, get } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import database from './firebase';

function Canvas() {
  const [isImgEditorShown, setIsImgEditorShown] = useState(true);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [savedImageData, setSavedImageData] = useState(null);
  const buttonRef = useRef(null);
  const auth = getAuth();
  const storage = getStorage();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const photoUrlParam = queryParams.get('photoUrl');
  const [selectedImage, setSelectedImage] = useState(photoUrlParam || null);

  const closeImgEditor = () => {
    setIsImgEditorShown(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleSave = async (savedImageData) => {
    if (savedImageData && savedImageData.imageCanvas) {
      savedImageData.imageCanvas.toBlob(async (blob) => {
        saveAs(blob, savedImageData.name);

        try {
          const { name, extension } = savedImageData;
          const filename = `${name}.${extension}`;
          const storageReference = storageRef(storage, `images/${filename}`);
          await uploadBytes(storageReference, blob);
          console.log('Image uploaded to Firebase Storage');

          const downloadURL = await getDownloadURL(storageReference);
          console.log('Download URL:', downloadURL);

          const user = auth.currentUser;
          if (user) {
            const userId = user.uid;
            const userRef = dbRef(database, `users/${userId}`);
            const userDataSnapshot = await get(userRef);
            const userData = userDataSnapshot.val();

            const updatedUrls = userData.urls ? userData.urls.filter(url => url !== selectedImage) : [];
            updatedUrls.push(downloadURL);

            await update(userRef, { urls: updatedUrls });
            console.log('Download URL saved to user database');

            setSelectedImage(downloadURL);
          }
        } catch (error) {
          console.log('Error uploading image:', error);
        }
      });
    }
  };


  const goBack = () => {
    const confirm = window.confirm(
      'Are you sure you want to leave? All unsaved progress will be lost'
    );
    if (confirm) {
      navigate('/user-panel');
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userReference = dbRef(database, `users/${user.uid}`);

        const unsubscribeData = onValue(userReference, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            console.log('User data not found in the database.');
          }
        });

        return () => {
          unsubscribeData();
        };
      } else {
        setUserData(null);
        console.log('User not authenticated.');
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  return (
    <div>
      <div className='bg-gradient-to-b from-blue-100 to-indigo-200 w-screen h-screen fixed z-30'>
        <nav className="bg-gradient-to-r from-indigo-300 via-purple-400 to-blue-500 w-full p-3 drop-shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="goback flex items-center">
                <button className='text-indigo-50 h-10 bg-transparent p-2 flex items-center rounded-md hover:bg-indigo-400 transition-colors duration-300' onClick={goBack}> <BiLeftArrowAlt className='w-6 h-6' /> </button>
              </div>
            </div>
            <div className="relative">
              {userData && (
                <div className="relative z-50">
                  <div
                    className="user-button text-indigo-50 h-10 bg-transparent p-2 flex items-center rounded-md"
                  >
                    <img
                      className="w-8 h-8 rounded-full mr-2"
                      src="./images/pfp.png"
                      alt=""
                    />
                    <span className="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis">
                      {userData.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="flex justify-center items-center min-h-screen bg-gray-300 over">
          {isImgEditorShown && (
            <div className="w-9/12 h-[50rem] bg-white drop-shadow-md p-6">
              <input type="file" accept="image/*" onChange={handleFileChange} id="upload" className='hidden' />
              <label htmlFor="upload" className='bg-[#6879eb] text-slate-50 text-xs px-3 py-2 cursor-pointer ml-4'>Upload</label>

              <FilerobotImageEditor
                source={selectedImage || "https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg"}
                onSave={(savedImageData, imageDesignState) => {
                  handleSave(savedImageData);
                  setSavedImageData(savedImageData);
                }}
                onClose={closeImgEditor}
                annotationsCommon={{
                  fill: '#ff0000',
                }}
                Text={{ text: 'Filerobot...' }}
                Rotate={{ angle: 90, componentType: 'slider' }}
                Crop={{
                  presetsItems: [
                    {
                      titleKey: 'classicTv',
                      descriptionKey: '4:3',
                      ratio: 4 / 3,
                    },
                    {
                      titleKey: 'cinemascope',
                      descriptionKey: '21:9',
                      ratio: 21 / 9,
                    },
                  ],
                  presetsFolders: [
                    {
                      titleKey: 'socialMedia',
                      groups: [
                        {
                          titleKey: 'facebook',
                          items: [
                            {
                              titleKey: 'profile',
                              width: 180,
                              height: 180,
                              descriptionKey: 'fbProfileSize',
                            },
                            {
                              titleKey: 'coverPhoto',
                              width: 820,
                              height: 312,
                              descriptionKey: 'fbCoverPhotoSize',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                }}
                tabsIds={[
                  TABS.ADJUST,
                  TABS.ANNOTATE,
                  TABS.WATERMARK,
                  TABS.FILTERS,
                  TABS.FINETUNE,
                  TABS.CROP,
                  TABS.ORIENTATION,
                  TABS.RESIZE,
                  TABS.REDEYE,
                  TABS.FRAMES,
                  TABS.TEXT,
                  TABS.SHAPES,
                  TABS.ICONS,
                  TABS.BACKGROUNDS,
                ]}
                hiddenTabs={[TABS.HEADER, TABS.STICKERS, TABS.OVERLAY]}
                customElements={[
                  {
                    component: () => (
                      <button
                        className="custom-button bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                        onClick={() => console.log('Custom Button Clicked')}
                      >
                        Custom Button
                      </button>
                    ),
                    group: 'header',
                  },
                ]}
                header={{ addDesignButton: { hidden: true } }}
                sidebar={{ addElementButton: { hidden: true } }}
                tools={[TOOLS.CROP, TOOLS.ROTATE, TOOLS.TEXT, TOOLS.RESIZE]}
                footer={{
                  rotateButton: {
                    hidden: true,
                  },
                  addElementButton: {
                    hidden: true,
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

}

export default Canvas;