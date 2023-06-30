import React, { useState, useEffect, useRef } from 'react'; //importurile bibliotecilor
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

function Canvas() { //declararea functiei Canvas
  const [isImgEditorShown, setIsImgEditorShown] = useState(true); //declararea functiilor prin hook-uri sau a diferitor variable
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
  const [selectedFormat, setSelectedFormat] = useState('image/png')

  const translations = { //adaugarea elementelor in limba romana in editorul foto
    ro: {
      labels: {
        crop: 'Decupare',
        rotate: 'Rotire',
        flipX: 'Flip Orizontal',
        flipY: 'Flip Vertical',
        brightness: 'Luminozitate',
        contrast: 'Contrast',
        hueSaturation: 'Nuanță/Saturare',
        warmth: 'Căldură',
        blur: 'Estompare',
        threshold: 'Threshold',
        posterize: 'Posterizare',
        pixelate: 'Pixelare',
        noise: 'Zgomot',
        filters: 'Filtre',
        annotate: 'Adnotare',
        resize: 'Redimensionare',
        stroke: 'Contur',
        save: 'Salvează',
        close: 'Închide',
      },
    },
  };

  const closeImgEditor = () => { //functionalitate inchidere editor
    setIsImgEditorShown(false);
  };

  const handleFileChange = (event) => { //functionalitate incarcare fisiere
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
  };
  const handleSave = async (savedImageData, selectedFormat) => { //functionalitate salvare imagini
    if (savedImageData && savedImageData.imageCanvas) {
      savedImageData.imageCanvas.toBlob(async (blob) => {
        let fileExtension = 'jpg';
        if (selectedFormat) {
          if (selectedFormat === 'image/jpeg') {
            fileExtension = 'jpg';
          } else if (selectedFormat === 'image/png') {
            fileExtension = 'png';
          } else if (selectedFormat === 'image/webp') {
            fileExtension = 'webp';
          }
        }

        const { name } = savedImageData;
        const filename = `${name}.${fileExtension}`;
        saveAs(blob, filename);

        try {
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


  const handleFormatSelection = (format) => {
    setSelectedFormat(format);
  };

  const goBack = () => { //functionalitate intoarcere la pagina de userpanel
    const confirm = window.confirm(
      'Ești sigur ca vrei să părăsești? Tot conținutul nesalvat va fi pierdut.'
    );
    if (confirm) {
      navigate('/user-panel');
    }
  };

  useEffect(() => { //verificare conexiune utilizator
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
  //codul JSX pentru interfata
  return (
    <div>
      <div className='bg-gradient-to-b from-blue-100 to-indigo-200 w-screen h-screen fixed '>
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
                    <span /*Afisarea numelui utilizatorului*/ className="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis">
                      {userData.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="flex justify-center  items-center min-h-screen ">
          {isImgEditorShown && ( /*Initializarea editorului foto si a functiei de incarcare imagini*/
            <div className="w-9/12  sm:h-[30rem] md:h-[35rem] lg:h-[40rem] bg-white drop-shadow-md p-6 max-[550px]:w-[20rem] sm:w-[40rem] md:w-[50rem] lg:w-[55rem]">
              <input type="file" accept="image/*" onChange={handleFileChange} id="upload" className='hidden' />
              <label htmlFor="upload" className='bg-slate-500 text-slate-50 text-xs px-[0.867rem] py-[0.367rem] max-[439px]:ml-[0.367rem] cursor-pointer ml-3 hover:bg-slate-600 font-arial'>Încarcă</label>

              <FilerobotImageEditor /*Editorul foto*/
                source={selectedImage || "https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg"}
                onSave={(savedImageData, imageDesignState) => {
                  handleSave(savedImageData, selectedFormat);
                  setSavedImageData(savedImageData);
                }}
                translations={translations}
                language="ro"
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
                          items: [                //Intre liniile 202-240 sunt descrise diferite tipuri de formatiuni de imagini, in functie de raportul de aspect sau rezolutii standard pentru web
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
                tabsIds={[ //Initializarea butoanelor de navigare
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