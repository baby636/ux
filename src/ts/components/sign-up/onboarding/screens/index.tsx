import React, { useState } from 'react';
import { Flex, Box, Text, Stack, Spinner, Input } from '@blockstack/ui';
import { Toast } from '../../toast';
import { ScreenTemplate } from '../../screen';
import { CheckList } from '../../checklist';
import { Collapse } from '../../collapse';
import { Image } from '../../../landing/image';
import { Link } from '../../../link';
import { Card } from '../../card';
import { SeedTextarea } from '../../seed-textarea';

import { SCREENS } from '../index';
import { howDataVaultWorks, faqs } from '../data';

import { useOnboardingState } from '../index';

import {
  doTrack,
  INTRO_CLOSED,
  INTRO_CREATE,
  INTRO_SIGN_IN,
  INTRO_HOW_WORKS,
  SECRET_KEY_INTRO_CLOSED,
  SECRET_KEY_INTRO_COPIED,
  SECRET_KEY_INSTR_CLOSE,
  SECRET_KEY_INSTR_CONFIRMED,
  CONNECT_CLOSED,
  CONNECT_SAVED,
  CONNECT_INCORRECT,
  CONNECT_BACK,
  SIGN_IN_CLOSED,
  SIGN_IN_CORRECT,
  SIGN_IN_INCORRECT,
  SIGN_IN_CREATE,
  SIGN_IN_FORGOT
} from '../../../../common/track';

const WinkAppIcon = ({ src = '/static/images/graphic-wink-app-icon-locked.png', ...rest }) => (
  <Box size={['48px', '78px']} mx="auto" {...rest}>
    <Image src={src} alt="Wink" />
  </Box>
);

const Intro = ({ next }: { next?: () => any }) => {
  const { doChangeScreen } = useOnboardingState();
  return (
    <>
      <ScreenTemplate
        before={<WinkAppIcon />}
        textAlign="center"
        noMinHeight
        title="Use Wink privately and securely with Data Vault"
        body={[
          'Wink will use your Data Vault to store your data privately, where no one but you can see it.',
          <Box mx="auto" width="128px" height="1px" bg="#E5E5EC" />,
          <CheckList
            items={[
              'Keep everything you do in Wink private with encryption and blockchain',
              'It’s free and takes just 2 minutes to create'
            ]}
          />
        ]}
        action={{
          label: 'Create Data Vault',
          onClick: () => {
            doTrack(INTRO_CREATE);
            next();
          }
        }}
        footer={
          <>
            <Stack spacing={4} isInline>
              <Link
                onClick={() => {
                  doTrack(INTRO_SIGN_IN);
                  doChangeScreen(SCREENS.SIGN_IN);
                }}
              >
                Sign in instead
              </Link>
              <Link
                onClick={() => {
                  doTrack(INTRO_HOW_WORKS);
                  doChangeScreen(SCREENS.HOW_IT_WORKS);
                }}
              >
                How Data Vault works
              </Link>
            </Stack>
            <Link>Help</Link>
          </>
        }
      />
    </>
  );
};

const HowItWorks = props => (
  <>
    <ScreenTemplate
      title="How Data Vault works"
      back={props.back}
      noMinHeight
      body={howDataVaultWorks.map(({ title, body, icon }, key) => (
        <Box key={key}>
          <Stack spacing={3}>
            <Box size="32px" borderRadius="8px">
              <img src={icon} alt={title} />
            </Box>
            <Text fontWeight="semibold">{title}</Text>
            <Text>{body}</Text>
          </Stack>
        </Box>
      ))}
    />
  </>
);

interface MockData {
  title: string;
  imageUrl: string;
}

const createTimeoutLoop = (setState, arr: MockData[], onEnd) =>
  arr.forEach((item, index) =>
    setTimeout(() => {
      setState(item);
      if (index === arr.length - 1) {
        onEnd();
      }
    }, (index + 1) * 2400)
  );

const Create = props => {
  const [state, setState] = React.useState({
    title: 'Creating your Data Vault',
    imageUrl: ''
  });

  const mockData: MockData[] = [
    {
      title: 'Private data storage',
      imageUrl: '/static/images/icon-delay-private.svg'
    },
    {
      title: 'Always-on encryption',
      imageUrl: '/static/images/icon-delay-padlock.svg'
    },
    {
      title: 'Access to 100s of apps',
      imageUrl: '/static/images/icon-delay-apps.svg'
    },
    {
      title: 'This will not display',
      imageUrl: ''
    }
  ];

  React.useEffect(() => {
    createTimeoutLoop(setState, mockData, () => props.next());
  }, []);

  return (
    <ScreenTemplate
      textAlign="center"
      before={
        state.imageUrl === '' ? (
          undefined
        ) : (
          <Box>
            <Text>Your Data Vault includes:</Text>
            <Flex mt={6} mx="auto" width="240px" height="152px" justifyContent="center">
              <img src={state.imageUrl} />
            </Flex>
          </Box>
        )
      }
      body={[
        <Box pt={10} width="100%">
          <Spinner thickness="3px" size="lg" color="blue" />
        </Box>
      ]}
      title={state.title}
    />
  );
};

const SecretKey = props => {
  const { secretKey } = useOnboardingState();
  const [copied, setCopiedState] = React.useState(false);

  React.useEffect(() => {
    if (copied) {
      setTimeout(() => {
        props.next();
      }, 2500);
    }
  });

  return (
    <>
      <ScreenTemplate
        title="Your Secret Key"
        body={[
          'Your Data Vault has a Secret Key: 12 words that unlock it, like the key to your home. Once lost, it’s lost forever. So save it somewhere you won’t forget.',
          (
            <Card title="Your Secret Key">
              <SeedTextarea readOnly value={secretKey} className="hidden-secret-key" />
            </Card>
          )
        ]}
        action={{
          label: 'Copy Secret Key',
          onClick: () => {
            doTrack(SECRET_KEY_INTRO_COPIED);
            const input: HTMLInputElement = document.querySelector('.hidden-secret-key');
            input.select();
            input.setSelectionRange(0, 99999)
            document.execCommand('copy');
            setCopiedState(true);
          },
          disabled: copied
        }}
      />
      <Toast show={copied} />
    </>
  );
};

const SaveKey = ({ next }) => {
  return (
    <ScreenTemplate
      title="Save your Secret Key"
      body={[
        'Paste your Secret Key wherever you keep critical, private, information such as passwords.',
        'Once lost, it’s lost forever. So save it somewhere you won’t forget.'
      ]}
      action={{
        label: "I've saved it",
        onClick: () => {
          doTrack(SECRET_KEY_INSTR_CONFIRMED);
          next();
        }
      }}
      after={<Collapse data={faqs} />}
    />
  );
};

const Connect = props => {
  const [isLoading, setLoading] = useState(false);
  return (
    <ScreenTemplate
      textAlign="center"
      before={<WinkAppIcon />}
      title="Connect Wink to your Data Vault"
      body={[
        'Enter your Secret Key to continue.',
        <Box>
          {/*Validate, track: CONNECT_INCORRECT */}
          <Input autoFocus minHeight="80px" placeholder="12-word Secret Key" as="textarea" />
        </Box>
      ]}
      action={{
        label: 'Continue',
        onClick: () => {
          setLoading(true);
          doTrack(CONNECT_SAVED);
          setTimeout(() => {
            props.next();
            setLoading(false);
          }, 1500);
        }
      }}
      isLoading={isLoading}
      footer={
        <>
          <Flex>
            <Text>Didn’t save your Secret Key?</Text>{' '}
            <Link
              onClick={() => {
                doTrack(CONNECT_BACK);
                props.back();
              }}
              pl={1}
              color="blue"
            >
              Go Back
            </Link>
          </Flex>
          <Link>Help</Link>
        </>
      }
    />
  );
};

const Final = props => {
  return (
    <ScreenTemplate
      textAlign="center"
      before={<WinkAppIcon />}
      title="You’re all set! Wink has been connected to your Data Vault"
      body={['Everything you do in Wink will be private, secure, and only accessible with your Secret Key.']}
      action={{
        label: 'Done',
        onClick: props.next
      }}
    />
  );
};

const SignIn = props => {
  const [isLoading, setLoading] = useState(false);
  const { doChangeScreen } = useOnboardingState();

  return (
    <ScreenTemplate
      textAlign="center"
      before={<WinkAppIcon src="/static/images/graphic-wink-app-icon.png" />}
      title="Sign into Wink"
      body={[
        'Enter your Data Vault’s Secret Key to continue',
        <Box>
          {/*Validate: track SIGN_IN_INCORRECT*/}
          <Input autoFocus minHeight="80px" placeholder="12-word Secret Key" as="textarea" />
        </Box>
      ]}
      action={[
        {
          label: 'Create a Data Vault',
          variant: 'text',
          onClick: () => {
            doTrack(SIGN_IN_CREATE);
            doChangeScreen(SCREENS.INTRO);
          }
        },
        {
          label: 'Continue',
          onClick: () => {
            setLoading(true);
            doTrack(SIGN_IN_CORRECT);
            setTimeout(() => {
              props.next();
              setLoading(false);
            }, 1500);
          }
        }
      ]}
      isLoading={isLoading}
      footer={
        <>
          <Flex>
            <Link onClick={() => doTrack(SIGN_IN_FORGOT)}>Forgot Secret Key?</Link>
          </Flex>
          <Link>Help</Link>
        </>
      }
    />
  );
};

export { Intro, HowItWorks, Create, SecretKey, Connect, SaveKey, Final, SignIn };